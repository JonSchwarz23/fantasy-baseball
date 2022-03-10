const csv = require("csv-parser");
const fs = require("fs");
const supabaseLib = require("@supabase/supabase-js");
const { parse } = require("path");
const { endianness } = require("os");

const supabaseUrl = "https://vlwcathblgioazsuzgfi.supabase.co";
const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTI1NTE5MiwiZXhwIjoxOTU0ODMxMTkyfQ.CihEqwHK5_BT9X5PoW9xRRUSEChQT0x6_fx_PMoBp8s";
const supabase = supabaseLib.createClient(supabaseUrl, SUPABASE_KEY);

addText = (obj, data, column, id) => {
    obj[id] = data[column] || null;
};

addInt = (obj, data, column, id) => {
    obj[id] = parseInt(data[column]) || null;
};

addFloat = (obj, data, column, id) => {
    obj[id] = parseFloat(data[column]) || null;
};

addPercentInt = (obj, data, column, id) => {
    obj[id] = parseInt(data[column].slice(0, -1)) || null;
};

const readIdMap = (file) => {
    const players = [];
    fs.createReadStream(file)
        .pipe(csv())
        .on("data", async (data) => {
            try {
                const player = {};
                addText(player, data, "IDPLAYER", "id");
                addText(player, data, "PLAYERNAME", "name");
                addText(player, data, "BIRTHDATE", "birth");
                addText(player, data, "FIRSTNAME", "firstName");
                addText(player, data, "LASTNAME", "lastName");
                addText(player, data, "TEAM", "team");
                addText(player, data, "LG", "league");
                addText(player, data, "POS", "position");
                addText(player, data, "IDFANGRAPHS", "fangraphsId");
                addText(player, data, "BPID", "bpId");
                addText(player, data, "BATS", "bats");
                addText(player, data, "THROWS", "throws");
                addText(player, data, "FANTRAXID", "fantraxId");
                addText(player, data, "ALLPOS", "allPositions");
                addText(player, data, "ACTIVE", "active");
                players.push(player);
            } catch (err) {
                console.log(err);
            }
        })
        .on("end", async () => {
            const { insertData, error } = await supabase.from("IdMap").insert(players, { upsert: true });
            console.log(insertData, error);
        });
};

const readFantrax = (file) => {
    const players = [];
    fs.createReadStream(file)
        .pipe(csv())
        .on("data", async (data) => {
            try {
                const player = {};
                addText(player, data, "ID", "id");
                addText(player, data, "Player", "name");
                addText(player, data, "Team", "team");
                addText(player, data, "Position", "position");
                addText(player, data, "Status", "status");
                addInt(player, data, "RkOv", "rank");
                addInt(player, data, "Age", "age");
                addInt(player, data, "Contract", "contract");
                addFloat(player, data, "Salary", "salary");
                addFloat(player, data, "Score", "score");
                addFloat(player, data, "ADP", "adp");
                addPercentInt(player, data, "%D", "percentDrafted");
                addPercentInt(player, data, "% Rostered", "percentRostered");
                players.push(player);
            } catch (err) {
                console.log(err);
            }
        })
        .on("end", async () => {
            const { insertData, error } = await supabase.from("FantraxRosters").insert(players, { upsert: true });
            console.log(insertData, error);
        });
};

const readFangraphProjections = async (file, projectionType) => {
    const players = [];
    const playersMap = {};
    const fangraphsToFantrax = {};

    const addToMap = async (start, end) => {
        let { data: idMap } = await supabase.from("IdMap").select("fantraxId,fangraphsId").range(start, end);
        idMap.forEach((pair) => {
            if (pair.fangraphsId) fangraphsToFantrax[pair.fangraphsId] = pair.fantraxId;
        });
    };

    await addToMap(0, 1000);
    await addToMap(1001, 2000);
    await addToMap(2001, 3000);

    fs.createReadStream(file)
        .pipe(csv())
        .on("data", async (data) => {
            try {
                const player = {};
                player.id = fangraphsToFantrax[data.PlayerId];
                if (!player.id) return;
                addFloat(player, data, "Dollars", projectionType);
                if (playersMap[player.id]) return;
                playersMap[player.id] = true;
                players.push(player);
            } catch (err) {
                console.log(err);
            }
        })
        .on("end", async () => {
            const { insertData, error } = await supabase.from("FantraxRosters").insert(players, { upsert: true });
            console.log(insertData, error);
        });
};

const readSalaries = async (file) => {
    fs.createReadStream(file)
        .pipe(csv())
        .on("data", async (data) => {
            try {
                const { data: dbData, error } = await supabase.from("FantraxRosters").update({ salaryEarned: data["2021 YTD"] }).eq("id", data["ID"]);
                if (error) console.log(error);
            } catch (err) {
                console.log(err);
            }
        })
        .on("end", async () => {
            console.log("done");
        });
};

readBids = async (file) => {
    fs.createReadStream(file)
        .pipe(csv())
        .on("data", async (data) => {
            try {
                const { data: dbData, error } = await supabase.from("FantraxRosters").update({ bid: data["BID"] }).eq("id", data["ID"]);
                if (error) console.log(error);
            } catch (err) {
                console.log(err);
            }
        })
        .on("end", async () => {
            console.log("done");
        });
};

readFA = async (file) => {
    fs.createReadStream(file)
        .pipe(csv())
        .on("data", async (data) => {
            try {
                const { data: dbData, error } = await supabase.from("FantraxRosters").update({ isFA: true }).eq("id", data[Object.keys(data)[0]]);
                if (error) console.log("error", error);
            } catch (err) {
                console.log("caught error", err);
            }
        })
        .on("end", async () => {
            console.log("done");
        });
};

const readHistoricalHittingData = (file, year) => {
    const players = [];
    fs.createReadStream(file)
        .pipe(csv())
        .on("data", async (data) => {
            try {
                //console.log(data);
                const player = { year };
                addText(player, data, "playerid", "id");
                addText(player, data, "﻿Name", "name");
                addText(player, data, "Team", "team");
                addInt(player, data, "G", "games");
                addInt(player, data, "AB", "atBats");
                addInt(player, data, "PA", "plateAppearances");
                addInt(player, data, "H", "hits");
                if (data["1B"]) addInt(player, data, "1B", "singles");
                else {
                    const toInt = (str) => parseInt(data[str]) || 0;
                    player["singles"] = toInt("H") - toInt("HR") - toInt("3B") - toInt("2B");
                }
                addInt(player, data, "2B", "doubles");
                addInt(player, data, "3B", "triples");
                addInt(player, data, "HR", "homeRuns");
                addInt(player, data, "RBI", "rbi");
                addInt(player, data, "BB", "walks");
                addInt(player, data, "SB", "stolenBases");
                addFloat(player, data, "AVG", "average");
                addFloat(player, data, "OPS", "ops");
                players.push(player);
            } catch (err) {
                console.log(err);
            }
        })
        .on("end", async () => {
            const { insertData, error } = await supabase.from("HistoricalHittingData").insert(players, { upsert: true });
            console.log(insertData, error);
        });
};

readFA("remainingFA.csv");
