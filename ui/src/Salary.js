import "./Salary.scss";
import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "./supabaseClient";
import DataTable from "./DataTable";

const Salary = ({ team }) => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const loadTeam = async () => {
            const buildRows = (rows) => {
                const contracts = rows.map((row) => row.contract).filter((row) => row !== undefined);
                const min = Math.min(...contracts);
                const max = Math.max(...contracts);

                rows.forEach((row) => {
                    let start = min;
                    while (start <= row.contract) {
                        row[start] = row.salary;
                        start += 1;
                    }
                });

                const total = { name: "Total", id: "total", class: "header" };
                let currentYear = max;

                while (currentYear >= min) {
                    let yearlyTotal = 0;
                    rows.forEach((row) => (yearlyTotal += row[currentYear] || 0));
                    total[currentYear] = yearlyTotal;
                    currentYear -= 1;
                }

                rows.push(total);
            };

            const reorderRows = (newRows, oldRows, groupName, positions) => {
                let playerPush = false;
                positions.forEach((position) => {
                    const possibleAdds = oldRows.filter((row) => row.position.includes(position));
                    possibleAdds.forEach((player) => {
                        if (!newRows.find((rows) => rows.id === player.id)) {
                            if (!playerPush) {
                                newRows.push({ name: groupName, class: "header", id: groupName });
                                playerPush = true;
                            }
                            newRows.push(player);
                        }
                    });
                });
            };

            const { data, error } = await supabase
                .from("FantraxRosters")
                .select("id,name,position,salary,contract,projection")
                .order("name", { ascending: true })
                .eq("status", team);

            const newRows = [];
            reorderRows(newRows, data, "Catchers", ["C"]);
            reorderRows(newRows, data, "Corner Infielders", ["1B", "3B"]);
            reorderRows(newRows, data, "Middle Infielders", ["2B", "SS"]);
            reorderRows(newRows, data, "Outfielders", ["OF"]);
            reorderRows(newRows, data, "Starting Pitchers", ["SP"]);
            reorderRows(newRows, data, "Relief Pitchers", ["RP"]);
            reorderRows(newRows, data, "Utility", ["UT"]);
            buildRows(newRows);

            setPlayers(newRows);
            console.log(data);
        };

        loadTeam();
    }, []);

    return (
        <div className="salary data-table-wrapper" style={{ "--main-color": "#228be6" }}>
            <DataTable
                rows={players}
                layout={[
                    { id: "name", title: "Name" },
                    { id: "position", title: "Position" },
                    { id: "2022", title: "2022", type: "number" },
                    { id: "2023", title: "2023", type: "number" },
                    { id: "2024", title: "2024", type: "number" },
                    { id: "2025", title: "2025", type: "number" },
                    { id: "2026", title: "2026", type: "number" },
                    { id: "2027", title: "2027", type: "number" },
                    { id: "2028", title: "2028", type: "number" },
                ]}
            />
        </div>
    );
};

export default Salary;
