const badges = {
  discord_employee: { value: 1, emoji: "<:staff:1426307616077906061>", rare: true },
  partnered_server_owner: { value: 2, emoji: "<:partner:1426307340956733550>", rare: true },
  hypesquad: { value: 4, emoji: "<:hypeshiny:1426307792649846954>", rare: true },
  bug_hunter_level_1: { value: 8, emoji: "<:bughunter_1:1426301430695727235>", rare: true },
  bug_hunter_level_2: { value: 16384, emoji: "<:bughunter_2:1426301432197419120>", rare: true },
  early_supporter: { value: 512, emoji: "<:early_supporter:1426301425503436852>", rare: true },
  verified_developer: { value: 131072, emoji: "<:developer:1426301434017611927>", rare: true },
  certified_moderator: { value: 262144, emoji: "<:alumni:1426308069775642770>", rare: true },
  nitro: { value: -1, emoji: "<:nitro:1426989748958003423>", rare: false },
  nitro_bronze: { value: -1, emoji: "<:bronze:1426301372042707004>", rare: false },
  nitro_silver: { value: -1, emoji: "<:silver:1426301370243485896>", rare: false },
  nitro_gold: { value: -1, emoji: "<:gold:1426301362085302294>", rare: false },
  nitro_platinum: { value: -1, emoji: "<:platinum:1426301366745432335>", rare: false },
  nitro_diamond: { value: -1, emoji: "<:diamond:1426301358805352600>", rare: true },
  nitro_emerald: { value: -1, emoji: "<:emerald:1426301360860692610>", rare: true },
  nitro_ruby: { value: -1, emoji: "<:ruby:1426301368536268870>", rare: true },
  nitro_opal: { value: -1, emoji: "<:opal:1426301365046612151>", rare: true },
  guild_booster_lvl1: { value: -1, emoji: "<:lvl1:1426304877063180359>", rare: false },
  guild_booster_lvl2: { value: -1, emoji: "<:lvl2:1426304881031118900>", rare: false },
  guild_booster_lvl3: { value: -1, emoji: "<:lvl3:1426304882654314647>", rare: false },
  guild_booster_lvl4: { value: -1, emoji: "<:lvl4:1426304884377915512>", rare: false },
  guild_booster_lvl5: { value: -1, emoji: "<:lvl5:1426304891961217144>", rare: false },
  guild_booster_lvl6: { value: -1, emoji: "<:lvl6:1426304893635002409>", rare: false },
  guild_booster_lvl7: { value: -1, emoji: "<:lvl7:1426304895841075342>", rare: false },
  guild_booster_lvl8: { value: -1, emoji: "<:lvl8:1426304897422463116>", rare: false },
  guild_booster_lvl9: { value: -1, emoji: "<:lvl9:1426304875284926565>", rare: false },
  one_char: { value: -1, emoji: "<:1c:1426308887270658108>", rare: false },
  two_char: { value: -1, emoji: "<:2c:1426308858942455829>", rare: false },
  three_char: { value: -1, emoji: "<:3c:1426308833780826283>", rare: false },
  hypesquad_bravery: { value: 64, emoji: "<:bravery:1426307338574102555>", rare: true },
  hypesquad_brilliance: { value: 128, emoji: "<:brilliance:1426307336946843653>", rare: true },
  hypesquad_balance: { value: 256, emoji: "<:balance:1426307334430261273>", rare: true },
  quest_completed: { value: -1, emoji: "<:quest_completed:1426305108462927933>", rare: false },
  orb_profile_badge: { value: -1, emoji: "<:orbs:1426305106944720947>", rare: false },
};

const id_map = {
  discord_employee: badges.discord_employee,
  staff: badges.discord_employee,
  partnered_server_owner: badges.partnered_server_owner,
  partner: badges.partnered_server_owner,
  hypesquad: badges.hypesquad,
  hypesquad_events: badges.hypesquad,
  bug_hunter_level_1: badges.bug_hunter_level_1,
  bug_hunter_level_2: badges.bug_hunter_level_2,
  early_supporter: badges.early_supporter,
  early_nitro_supporter: badges.early_supporter,
  verified_developer: badges.verified_developer,
  early_verified_bot_developer: badges.verified_developer,
  certified_moderator: badges.certified_moderator,
  moderator_programs_alumni: badges.certified_moderator,
  premium: badges.nitro,
  premium_tenure_1_month_v2: badges.nitro_bronze,
  premium_tenure_3_month_v2: badges.nitro_silver,
  premium_tenure_6_month_v2: badges.nitro_gold,
  premium_tenure_12_month_v2: badges.nitro_platinum,
  premium_tenure_24_month_v2: badges.nitro_diamond,
  premium_tenure_36_month_v2: badges.nitro_emerald,
  premium_tenure_60_month_v2: badges.nitro_ruby,
  premium_tenure_72_month_v2: badges.nitro_opal,
  guild_booster_lvl1: badges.guild_booster_lvl1,
  guild_booster_lvl2: badges.guild_booster_lvl2,
  guild_booster_lvl3: badges.guild_booster_lvl3,
  guild_booster_lvl4: badges.guild_booster_lvl4,
  guild_booster_lvl5: badges.guild_booster_lvl5,
  guild_booster_lvl6: badges.guild_booster_lvl6,
  guild_booster_lvl7: badges.guild_booster_lvl7,
  guild_booster_lvl8: badges.guild_booster_lvl8,
  guild_booster_lvl9: badges.guild_booster_lvl9,
  hypesquad_bravery: badges.hypesquad_bravery,
  hypesquad_house_1: badges.hypesquad_bravery,
  hypesquad_brilliance: badges.hypesquad_brilliance,
  hypesquad_house_2: badges.hypesquad_brilliance,
  hypesquad_balance: badges.hypesquad_balance,
  hypesquad_house_3: badges.hypesquad_balance,
  quest_completed: badges.quest_completed,
  orb_profile_badge: badges.orb_profile_badge,
};

const rare_mask = 1 | 2 | 4 | 8 | 16384 | 512 | 131072 | 262144 | 64 | 128 | 256;

const has_rare = (flags) => (flags & rare_mask) !== 0;

const get_name_badge = (username) => {
  if (username.length === 1) return badges.one_char;
  if (username.length === 2) return badges.two_char;
  if (username.length === 3) return badges.three_char;
  return null;
};

const parse = (member, profile_data) => {
  const result = new Set();
  const flags = member.user.flags?.bitfield || 0;

  for (const key in badges) {
    const b = badges[key];
    if (b.value > 0 && (flags & b.value) === b.value) {
      result.add(b);
    }
  }

  if (profile_data && Array.isArray(profile_data.badges)) {
    for (const b of profile_data.badges) {
      const mapped = id_map[b.id];
      if (mapped) result.add(mapped);
    }
  }

  const name_badge = get_name_badge(member.user.username);
  if (name_badge) result.add(name_badge);

  const list = [...result];
  return {
    emojis: list.map((b) => b.emoji).join(" ") || "none",
    has_rare: list.some((b) => b.rare),
    list,
  };
};

module.exports = { badges, parse, has_rare };
