/**
 * Welcome to KillerCube's TimeStamper, which enables the ability to
 * mark player and world times.
 * 
 * This includes being able to stamp or save times within the world and
 * load them for later use. With this you can create daily crates, idle 
 * tycoons, hourly rewards, and more!
 * 
 * Enjoy creating your favorite features!
 * 
 * Version: 1.0
 * Last Updated: 6/3/2022
 */


import { Player, world } from 'mojang-minecraft';

const OVERWORLD = world.getDimension('overworld');


/**
 * @remarks
 * Save the current time with an identifier, optionally you can
 * include a player to save the value to
 * @param {string} identifier
 * @param {Player} player
 */
export function saveTime(identifier, player = null) {
    setObjective('js.dates');

    let json = {};
    if (player == null) {
        resetExistingTime(identifier);
        json = { value: Date.now() };
    } else {
        resetExistingTime(identifier, player.nameTag);
        json = { value: Date.now(), player: player.nameTag };
    }

    const strjson = JSON.stringify(json);

    setTime('js.dates', `&..&>${identifier}>${strjson.replace(/"/g, '&&^\'').replace(/,/g, '&&^.')}`);
}

/**
 * @remarks
 * Get the current time for comparison
 */
export function getTime() {
    const time = Date.now();
    const item = createTimeItem(time);
    return item;
}

/**
 * @remarks
 * Compares two loaded times from loadTime() function
 * and gets the difference
 * timeA - timeB = return
 * @param {time} timeA
 * @param {time} timeB
 * @param {string} timeType - milliseconds | seconds | minutes | hours | days | weeks | years
 */
export function compareTimes(timeA, timeB, timeType) {
    return Math.abs(timeA[timeType] - timeB[timeType]);
}

/**
 * @remarks
 * Load a time using the saved identifier, optionally you can
 * include a player to find the value for
 * @param {string} identifier
 * @param {Player} player
 */
export function loadTime(identifier, player = null) {
    const set = getTimes();

    for (const item of set) {
        if (item.identifier == identifier) {
            if (player != null) {
                if (player.nameTag == item.json.player) return createTimeItem(item.json.value);
            } else {
                return createTimeItem(item.json.value);
            }
        }
    }

    return undefined;
}

/**
 * @ignore
 */
function createTimeItem(value) {
    return {
        milliseconds: value,
        seconds: value / 1000,
        minutes: value / 60000,
        hours: value / 3600000,
        days: value / 86400000,
        weeks: value / 604800000,
        years: value / 31536000000
    };
}

/**
 * @ignore
 */
function resetExistingTime(identifier, name = undefined) {
    const set = getTimes();
    for (const item of set) {
        if (item.identifier == identifier && item.json.player == name) {
            const name = `&..&>${item.identifier}>${JSON.stringify(item.json).replace(/"/g, '&&^\'').replace(/,/g, '&&^.')}`;
            try {
                OVERWORLD.runCommand(`scoreboard players reset "${name}"`);
            } catch { }
            break;
        }
    }
}

/**
 * @ignore
 */
function setObjective(name) {
    try {
        OVERWORLD.runCommand(`scoreboard objectives add ${name} dummy`);
    } catch { }
}

/**
 * @ignore
 */
function setTime(objective, value) {
    try {
        OVERWORLD.runCommand(`scoreboard players set "${value}" "${objective}" 0`);
    } catch { }
}

/**
 * @ignore
 */
function getTimes() {
    try {
        const result = OVERWORLD.runCommand(`scoreboard players list`).statusMessage
            .split('\n')[1]
            .split(',');

        let finished = [];
        for (let score of result) {
            if (score[0] == " ") score = score.slice(1);
            if (score.substring(0, 5) == '&..&>') {
                const identity = score.split('>')[1];
                const json = score.split('>')[2].replace(/&&\^'/g, '"').replace(/&&\^./g, ',');
                finished.push({ identifier: identity, json: JSON.parse(json) });
            }
        }
        return finished;
    } catch (e) {
        return [];
    }
}