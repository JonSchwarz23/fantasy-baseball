import { useState } from "react";
import "./DataTable.scss";

const NumberCell = ({ value, field }) => {
    const precision = field.precision || 2;
    return <td key={field.id}>{value?.toFixed(precision)}</td>;
};

const TextCell = ({ value, field }) => {
    return <td key={field.id}>{value}</td>;
};

const BoolCell = ({ value, field }) => {
    return <td key={field.id}>{value.toString()}</td>;
};

const cellFactory = (value, field) => {
    switch (field.type) {
        case "number":
            return <NumberCell key={field.id} value={value} field={field} />;
        case "bool":
            return <BoolCell key={field.id} value={value} field={field} />;
        default:
            return <TextCell key={field.id} value={value} field={field} />;
    }
};

const Row = ({ data, layout, events = {} }) => {
    return (
        <tr
            {...(events.doubleClick && { onDoubleClick: () => events.doubleClick(data) })}
            {...(events.click && { onClick: () => events.click(data) })}
            className={data.class || ""}
        >
            {layout.map((field) => cellFactory(data[field.id], field))}
        </tr>
    );
};

const Filter = ({ onUpdate }) => {
    const [filter, setFilter] = useState("");
    const [lastSent, setLastSent] = useState("");

    const handleChange = (event) => {
        setFilter(event.target.value);
    };

    const getFilter = (input) => {
        const build = (type, input) => {
            switch (type) {
                case "=":
                    return { type: "Equals", value: input };
                case "$":
                    return { type: "Contains", value: input };
                case ">":
                    return { type: "GreaterThan", value: input };
                case "<":
                    return { type: "LessThan", value: input };
                case "!":
                    return { type: "Not", value: getFilter(input) };
                default:
                    return null;
            }
        };

        const buildMultiFilter = (split) => {
            let prevFilter = "=";
            const validFilters = ["=", "$", ">", "<", "!"];

            let rawFilters = input.split(split);
            rawFilters = rawFilters.map((rawFilter) => {
                if (!validFilters.includes(rawFilter[0])) return prevFilter + rawFilter;
                prevFilter = rawFilter[0];
                return rawFilter;
            });

            return rawFilters.map((input) => build(input[0], input.slice(1)));
        };

        if (input.includes("|")) {
            return { type: "Or", value: buildMultiFilter("|") };
        }

        if (input.includes("&")) {
            return { type: "And", value: buildMultiFilter("&") };
        }

        return build(input[0], input.slice(1));
    };

    const handleBlur = (event) => {
        if (event.target.value === lastSent) return;
        onUpdate(getFilter(event.target.value));
        setLastSent(event.target.value);
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            if (event.target.value === lastSent) return;
            onUpdate(getFilter(event.target.value));
            setLastSent(event.target.value);
        }
    };

    return (
        <th>
            <input className="filter" type="text" value={filter} onChange={handleChange} onBlur={handleBlur} onKeyPress={handleKeyPress} />
        </th>
    );
};

const DataTable = ({ rows, update, layout, defaultSort, rowEvents }) => {
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState(defaultSort);

    const onSortUpdate = (id) => {
        let newSort = sort;
        if (sort && sort.id === id) newSort = { id, direction: sort.direction === "descending" ? "ascending" : "descending" };
        else newSort = { id, direction: "descending" };
        setSort(newSort);

        update(Object.values(filters), newSort);
    };

    const onFilterUpdate = (field, filter) => {
        if (!filter) delete filters[field];
        else {
            filter.field = field;
            filters[field] = filter;
        }

        setFilters(filters);
        update(Object.values(filters), sort);
    };

    return (
        <table className="data-table">
            <thead>
                <tr>
                    {layout.map((field) => (
                        <th className="title" onClick={() => field.sortable && onSortUpdate(field.id)} key={field.id}>
                            {field.title}
                            {sort && sort.id === field.id && <span className="sort-arrow">{sort.direction === "ascending" ? "▲" : "▼"}</span>}
                        </th>
                    ))}
                </tr>
                {layout.find((field) => field.filterable) && (
                    <tr>
                        {layout.map((field) =>
                            field.filterable ? <Filter key={field.id} onUpdate={(filter) => onFilterUpdate(field.id, filter)} /> : <th></th>
                        )}
                    </tr>
                )}
            </thead>
            <tbody>
                {rows.map((row) => (
                    <Row events={rowEvents} key={row.id} data={row} layout={layout} />
                ))}
            </tbody>
        </table>
    );
};

export default DataTable;
