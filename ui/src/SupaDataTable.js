import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";
import DataTable from "./DataTable";

const SupaDataTable = ({ name, layout, maxRows, defaultSort, rowEvents }) => {
    const [error, setError] = useState(null);
    const [players, setPlayers] = useState([]);

    const filters = {
        Equals: "eq",
        Contains: "ilike",
        GreaterThan: "gt",
        LessThan: "lt",
    };

    const addFilter = (query, filter) => {
        const buildValueString = (type, value) => {
            return type === "Contains" ? `%${value}%` : value;
        };

        switch (filter.type) {
            case "Equals":
                query = query.eq(filter.field, buildValueString(filter.type, filter.value));
                break;
            case "Contains":
                query = query.ilike(filter.field, buildValueString(filter.type, filter.value));
                break;
            case "GreaterThan":
                query = query.gt(filter.field, buildValueString(filter.type, filter.value));
                break;
            case "LessThan":
                query = query.lt(filter.field, buildValueString(filter.type, filter.value));
                break;
            case "Not":
                query = query.not(filter.field, filters[filter.value.type], buildValueString(filter.value.type, filter.value.value));
                break;
            case "Or":
                query = query.or(
                    filter.value
                        .map((iFilter) => {
                            if (iFilter.type === "Not")
                                return `${filter.field}.not.${filters[iFilter.value.type]}.${buildValueString(iFilter.value.type, iFilter.value.value)}`;
                            return `${filter.field}.${filters[iFilter.type]}.${buildValueString(iFilter.type, iFilter.value)}`;
                        })
                        .join(",")
                );
                break;
            case "And":
                filter.value.forEach((iFilter) => {
                    iFilter.field = filter.field;
                    addFilter(query, iFilter);
                });
                break;
            default:
                return query;
        }
    };

    const update = async (filters, sort) => {
        let query = supabase.from(name).select("*");
        if (sort) query = query.order(sort.id, { ascending: sort.direction === "ascending" });
        if (maxRows) query = query.range(0, maxRows);
        filters.forEach((filter) => addFilter(query, filter));
        const { data, dbError } = await query;
        setError(dbError);
        setPlayers(data || []);
    };

    useEffect(() => {
        update([], defaultSort, !layout);
    }, []);

    if (error) return <div>{error}</div>;

    return (
        <div className="data-table-wrapper">
            {layout && <DataTable update={update} rowEvents={rowEvents} defaultSort={defaultSort} rows={players} layout={layout} />}
        </div>
    );
};

export default SupaDataTable;
