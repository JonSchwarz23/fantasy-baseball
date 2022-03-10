import "./App.scss";

import { supabase } from "./supabaseClient";
import { useState } from "react";
import { useEffect } from "react";

import SupaDataTable from "./SupaDataTable";
import Salary from "./Salary";
import Popup from "./Popup";
import DataTable from "./DataTable";

const Tabs = ({ setTab }) => {
    return (
        <div className="tabs">
            <button onClick={() => setTab("Search")}>Search</button>
            <button onClick={() => setTab("Salaries")}>Salaries</button>
        </div>
    );
};

const StatsModal = ({ data, onClose }) => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const getStats = async () => {
            const { data: idMapData } = await supabase.from("IdMap").select("fangraphsId").eq("fantraxId", data.id);
            if (idMapData[0]) {
                let { data: historicalHittingData } = await supabase.from("HistoricalHittingData").select("*").eq("id", idMapData[0].fangraphsId);
                historicalHittingData = historicalHittingData || [];
                historicalHittingData.forEach((data) => (data.id = data.year));
                historicalHittingData.sort((a, b) => {
                    if (a.year === "Total") return 1;
                    if (a.year === "Proj" && b.year !== "Total") return 1;
                    if (parseInt(a.year) > parseInt(b.year)) return 1;
                    else return -1;
                });
                setStats(historicalHittingData);
            }
        };

        getStats();
    }, []);

    return (
        <Popup>
            <div className="stats-modal">
                <div className="header">
                    <h1>{data.name}</h1>
                    <i class="fas fa-times" onClick={onClose}></i>
                </div>

                <div className="data-table-wrapper">
                    <DataTable
                        layout={[
                            { id: "year", title: "Year" },
                            { id: "team", title: "Team" },
                            { id: "games", title: "G" },
                            { id: "atBats", title: "AB" },
                            { id: "plateAppearances", title: "PA" },
                            { id: "hits", title: "H" },
                            { id: "singles", title: "1B" },
                            { id: "doubles", title: "2B" },
                            { id: "triples", title: "3B" },
                            { id: "homeRuns", title: "HR" },
                            { id: "rbi", title: "RBI" },
                            { id: "walks", title: "BB" },
                            { id: "stolenBases", title: "SB" },
                            { id: "average", title: "AVG", type: "number", precision: 3 },
                            { id: "ops", title: "OPS", type: "number", precision: 3 },
                        ]}
                        rows={stats}
                    />
                </div>
            </div>
        </Popup>
    );
};

const App = () => {
    const [tab, setTab] = useState("Search");
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    return (
        <div className="app">
            <Tabs setTab={(tab) => setTab(tab)} />
            {tab === "Search" && (
                <SupaDataTable
                    name={"FantraxRosters"}
                    rowEvents={{
                        doubleClick: (data) => {
                            setSelectedPlayers([data, ...selectedPlayers]);
                        },
                        click: (data) => {
                            navigator.clipboard.writeText(data.id);
                            console.log(data);
                        },
                    }}
                    maxRows={50}
                    layout={[
                        { id: "name", title: "Name", filterable: true, sortable: true },
                        { id: "team", title: "Team", filterable: true, sortable: true },
                        { id: "position", title: "Position", filterable: true, sortable: true },
                        { id: "rank", title: "Rank", filterable: true, sortable: true },
                        { id: "status", title: "Status", filterable: true, sortable: true },
                        { id: "isFA", title: "FA", filterable: true, sortable: true, type: "bool" },
                        { id: "age", title: "Age", filterable: true, sortable: true },
                        { id: "salary", title: "Salary", filterable: true, sortable: true },
                        { id: "prevProjection", title: "2021 Projection", type: "number", filterable: true, sortable: true },
                        { id: "salaryEarned", title: "Salary Earned", filterable: true, sortable: true },
                        { id: "atcProjection", title: "ATC Projection", type: "number", filterable: true, sortable: true },
                        { id: "zipsProjection", title: "ZiPS Projection", type: "number", filterable: true, sortable: true },
                        { id: "projection", title: "Steamer Projection", type: "number", filterable: true, sortable: true },
                        { id: "averageProjection", title: "Average Projection", type: "number", filterable: true, sortable: true },
                        { id: "contract", title: "Contract", filterable: true, sortable: true },
                        { id: "percentDrafted", title: "% Drafted", filterable: true, sortable: true },
                        { id: "adp", title: "ADP", filterable: true, sortable: true },
                    ]}
                />
            )}
            {tab === "Salaries" && <Salary team={"MC"} />}
            {selectedPlayers.map((player) => (
                <StatsModal key={player.id} data={player} onClose={() => setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id))} />
            ))}
        </div>
    );
};

export default App;
