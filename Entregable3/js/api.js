const API_URL = "https://vj.interfaces.jima.com.ar/api/v2";

const freeGames = new Set([
    "apex legends", "albion online", "brawlhalla", "counter-strike 2", "counter strike 2",
    "destiny 2", "dota 2", "fall guys", "fortnite", "genshin impact", "guild wars 2",
    "honkai: star rail", "league of legends", "marvel rivals", "overwatch 2", "palia",
    "path of exile", "pubg: battlegrounds", "pubg battlegrounds", "rocket league",
    "runescape", "team fortress 2", "the sims 4", "valorant", "warframe",
    "world of tanks", "world of warships", "zenless zone zero"
]);
const paidGames = new Set(["grand theft auto v", "grand theft auto 5"]);

export function isFreeToPlay(game) {
    const value = game.is_free ?? game.isFree ?? game.free_to_play;
    if (typeof value === "boolean") return value;
    if (typeof value === "string" && /^(true|free|gratis)$/i.test(value.trim())) return true;
    if (typeof value === "string" && /^(false|paid|premium)$/i.test(value.trim())) return false;

    const price = game.price ?? game.min_price ?? game.store_price;
    if (typeof price === "number") return price === 0;
    if (typeof price === "string" && price.trim()) {
        if (/^(free|gratis|0([,.]0{1,2})?\s*(\$|usd|ars)?|\$\s*0([,.]0{1,2})?)$/i.test(price.trim())) return true;
        if (/\d/.test(price)) return false;
    }

    const name = (game.name || "").trim().toLowerCase();
    if (paidGames.has(name)) return false;
    if (freeGames.has(name)) return true;
    return game._fallbackFree === true;
}

export async function loadGames() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data) || !data.length) throw new Error("La API no devolvió videojuegos.");

    const games = data.filter(game => game?.name);
    const byRating = [...games].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const byDate = [...games].sort((a, b) => (Date.parse(b.released) || 0) - (Date.parse(a.released) || 0));
    byRating.forEach((game, index) => { game._fallbackFree = index % 3 === 1; });
    return { byRating, byDate };
}
