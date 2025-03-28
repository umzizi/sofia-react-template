import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import events from "./events";
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.locale("en-GB");
const localizer = momentLocalizer(moment);

export default function ReactBigCalendar() {
    const [eventsData, setEventsData] = useState(events);
  
    const handleSelect = ({ start, end }) => {
      console.log(start);
      console.log(end);
      const title = window.prompt("New Event name");
      if (title)
        setEventsData([
          ...eventsData,
          {
            start,
            end,
            title
          }
        ]);
    };
  
    return (
      <div className="App" style={{ maxWidth: "800px", margin: "auto" }}>
        <Calendar
          views={["month"]}
          selectable
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="month"
          events={eventsData}
          style={{ height: "500px" }} // 높이 조정
          onSelectEvent={(event) => alert(event.title)}
          onSelectSlot={handleSelect}
        />
      </div>
    );
  }