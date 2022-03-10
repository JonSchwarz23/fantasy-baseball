import "./Search.scss";
import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";
import DataTable from "./DataTable";

const Search = () => {
    const [error, setError] = useState(null);
    const [players, setPlayers] = useState([]);
    const defaultSort = { id: "projection", direction: "descending" };

    const addFilter = (query, filter) => {
        switch (filter.type) {
            case "Equals":
                return query.eq(filter.field, filter.value);
            case "Contains":
                return query.ilike(filter.field, `%${filter.value}%`);
            case "GreaterThan":
                return query.gt(filter.field, filter.value);
            case "LessThan":
                return query.lt(filter.field, filter.value);
            default:
                return query;
        }
    };

    const update = async (filters, sort) => {
        let query = supabase
            .from("FantraxRosters")
            .select("*")
            .order(sort.id, { ascending: sort.direction === "ascending" })
            .range(0, 50);
        filters.forEach((filter) => (query = addFilter(query, filter)));
        const { data, dbError } = await query;
        setError(dbError);
        setPlayers(data || []);
    };

    useEffect(() => {
        update([], defaultSort);
    }, []);

    if (error) return <div>{error}</div>;

    return (
        <div className="search">
            <div>
                <DataTable
                    update={update}
                    defaultSort={defaultSort}
                    players={players}
                    customLayout={[
                        { id: "name", title: "Name", filterable: true, sortable: true },
                        { id: "team", title: "Team", filterable: true },
                        { id: "position", title: "Position", filterable: true },
                        { id: "rank", title: "Rank", filterable: true },
                        { id: "status", title: "Status", filterable: true },
                        { id: "age", title: "Age", filterable: true },
                        { id: "salary", title: "Salary", filterable: true },
                        { id: "prevProjection", title: "2021 Projection", type: "number", filterable: true },
                        { id: "salaryEarned", title: "Salary Earned", filterable: true },
                        { id: "projection", title: "Projection", type: "number", filterable: true },
                        { id: "contract", title: "Contract", filterable: true },
                        { id: "score", title: "Score", filterable: true },
                        { id: "percentDrafted", title: "% Drafted", filterable: true },
                        { id: "adp", title: "ADP", filterable: true },
                        { id: "percentRostered", title: "% Rostered", filterable: true },
                    ]}
                />
            </div>
        </div>
    );
};

export default Search;
