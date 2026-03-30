const { Client } = require("discord.js-selfbot-v13");
const chalk = require("chalk");
const fs = require("fs");
const toml = require("toml");
const { parse, has_rare } = require("./badges");

const config = toml.parse(fs.readFileSync("./config.toml", "utf-8"));

const log = {
  info: (msg) => console.log(chalk.cyan("[info]") + " " + msg),
  success: (msg) => console.log(chalk.green("[success]") + " " + msg),
  warn: (msg) => console.log(chalk.yellow("[warn]") + " " + msg),
  error: (msg) => console.log(chalk.red("[error]") + " " + msg),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const client = new Client();

const fetch_profile = async (user_id, guild_id) => {
  try {
    const res = await client.api.users(user_id).profile.get({
      query: {
        with_mutual_guilds: false,
        with_mutual_friends: false,
        with_mutual_friends_count: false,
        guild_id: guild_id,
      },
    });
    return res;
  } catch (err) {
    if (err.status === 429) {
      const wait = err.data?.retry_after || 5;
      log.warn(`rate limited, waiting ${wait}s...`);
      await sleep(wait * 1000);
      return fetch_profile(user_id, guild_id);
    }
    return null;
  }
};


const concurrent = async (tasks, limit) => {
  const results = [];
  let i = 0;
  const run = async () => {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, () => run()));
  return results;
};

const fetch_all_members = async (guild) => {
  log.info("fetching members...");
  try {
    await guild.members.fetch();
    const members = guild.members.cache;
    log.info(`fetched ${chalk.bold(members.size)} members`);
    return members;
  } catch (err) {
    log.error(`fetch failed: ${err.message}`);
    return guild.members.cache;
  }
};

const process_guild = async (guild, channel, webhook) => {
  log.info(`fetching members from ${chalk.bold(guild.name)}...`);

  const all = await fetch_all_members(guild);
  if (all.size === 0) {
    log.error("no members fetched");
    return;
  }

  const humans = [...all.values()].filter((m) => !m.user.bot);
  const total = humans.length;
  log.info(`found ${chalk.bold(total)} members (excluding bots)`);

  const rare_members = [];
  for (const member of humans) {
    const flags = member.user.flags?.bitfield || 0;
    const is_short = member.user.username.length <= 3;
    const is_nitro = member.premiumSince || member.user.premiumType > 0;

    if (has_rare(flags) || is_short || is_nitro) {
      rare_members.push(member);
    }
  }

  log.info(`found ${chalk.bold(rare_members.length)} members with rare badges`);

  if (rare_members.length === 0) {
    await webhook.send({ content: `**scan complete: ${guild.name}**\ntotal: ${total}\nrare badges: 0` });
    log.success(`done! no rare badges found`);
    return;
  }

  const lines = [];
  const delay = config.delay || 50;
  const concurrency = config.concurrency || 15;

  const tasks = rare_members.map((member, i) => async () => {
    await sleep(delay);
    const profile = await fetch_profile(member.user.id, guild.id);
    const badge_data = parse(member, profile);
    
    if (badge_data.has_rare) {
      lines[i] = `${member.user.username} (<@${member.user.id}>) ${badge_data.emojis}`;
    }

    if ((i + 1) % 50 === 0 || i === rare_members.length - 1) {
      log.info(`progress: ${chalk.bold(i + 1)}/${chalk.bold(rare_members.length)} scanned`);
    }
  });

  await concurrent(tasks, concurrency);

  const filtered = lines.filter(Boolean);
  let batch = "";
  for (const line of filtered) {
    if ((batch + line + "\n").length > 1999) {
      try { await webhook.send({ content: batch }); } catch { log.error("failed to send batch"); }
      batch = line + "\n";
    } else {
      batch += line + "\n";
    }
  }
  if (batch) {
    try { await webhook.send({ content: batch }); } catch { log.error("failed to send batch"); }
  }

  const summary = [
    `scan complete: ${guild.name}`,
    `total: ${total}`,
    `rare badges: ${filtered.length}`,
  ].join("\n");

  try {
    await webhook.send({ content: summary });
  } catch {
    log.error("failed to send summary");
  }

  log.success(`done! ${chalk.bold(total)} scanned, ${chalk.yellow(filtered.length + " rare")}`);
};

client.on("ready", async () => {
  console.log();
  log.success(`logged in as ${chalk.bold(client.user.tag)}`);
  log.info(`id: ${chalk.white(client.user.id)}`);
  log.info(`servers: ${chalk.white(client.guilds.cache.size)}`);
  log.info(`friends: ${chalk.white(client.relationships.friendCache.size)}`);
  console.log();
});

const start_check = async (guild) => {
  const target = client.guilds.cache.get(config.target_server);
  if (!target) {
    log.error("target server not in cache");
    return;
  }
  const category = target.channels.cache.get(config.target_category);

  if (!category) {
    log.error("target category not found");
    return;
  }

  let channel;
  try {
    channel = await target.channels.create(guild.name, {
      type: "GUILD_TEXT",
      parent: category.id,
    });
  } catch (err) {
    log.error(`channel create failed: ${err.message}`);
    return;
  }

  let webhook;
  try {
    webhook = await channel.createWebhook("scraper", {
      avatar: client.user.displayAvatarURL({ format: "png" }),
    });
  } catch (err) {
    log.error(`webhook create failed: ${err.message}`);
    return;
  }

  log.success(`created channel: ${chalk.bold("#" + channel.name)} in ${chalk.bold(target.name)}`);
  await process_guild(guild, channel, webhook);
};

client.on("guildCreate", async (guild) => {
  try {
    log.info(`joined server: ${chalk.bold(guild.name)}`);
    await start_check(guild);
  } catch (err) {
    log.error(`failed: ${err.message}`);
  }
});

client.on("messageCreate", async (msg) => {
  if (msg.channel.id === config.command_channel) {
    if (!msg.content.startsWith(config.prefix)) return;
    log.info(`command received: ${chalk.white(msg.content)} from ${chalk.bold(msg.author.tag)} (${msg.author.id})`);

    const allowed = [client.user.id, ...config.owners];
    if (!allowed.includes(msg.author.id)) {
      log.warn(`ignoring command from unauthorized user: ${msg.author.tag}`);
      return;
    }
    
    if (!msg.content.startsWith(config.prefix + "check ")) {
      log.info(`unknown command or missing check: ${msg.content}`);
      return;
    }

    const server_id = msg.content.split(" ")[1]?.trim();
    if (!server_id) {
      log.warn("missing server id in check command");
      return;
    }

    try {
      let guild = client.guilds.cache.get(server_id);
      if (!guild) {
        log.error(`server not found: ${server_id}`);
        await msg.channel.send("server not found (not in cache)");
        return;
      }
      log.info(`manual check: ${chalk.bold(guild.name)}`);
      await msg.channel.send(`checking **${guild.name}**...`);
      await start_check(guild);
    } catch (err) {
      log.error(`check failed: ${err.message}`);
      try { await msg.channel.send(`error: ${err.message}`); } catch {}
    }
  }
});

client.login(config.token);
