import { useRef } from "react";
import { useState } from "react";
import "./Popup.scss";

const Popup = ({ children }) => {
    const popup = useRef(null);
    const [location, setLocation] = useState(null);

    const handleMouseMove = (event) => {
        if (location) {
            popup.current.style.left = location.box.x + event.clientX - location.mouse.x + "px";
            popup.current.style.top = location.box.y + event.clientY - location.mouse.y + "px";
        }
    };

    if (location) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener(
            "mouseup",
            () => {
                window.removeEventListener("mousemove", handleMouseMove);
                setLocation(null);
            },
            { once: true }
        );
    }

    const handleMouseDown = (event) => {
        setLocation({ box: popup.current.getBoundingClientRect(), mouse: { x: event.clientX, y: event.clientY } });
    };

    return (
        <div>
            <div ref={popup} onMouseDown={handleMouseDown} className="popup">
                {children}
            </div>
        </div>
    );
};

export default Popup;
