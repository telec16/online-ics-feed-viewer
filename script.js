const mapping = {
  dtstart: "start",
  dtend: "end",
  summary: "title",
};

const value_type_mapping = {
  "date-time": (input) => {
    if (input.substr(-3) === "T::") {
      return input.substr(0, input.length - 3);
    }
    return input;
  },
};

function load_ics(ics_data) {
  const parsed = ICAL.parse(ics_data);
  const events = parsed[2].map(([type, event_fields]) => {
    if (type !== "vevent") return;
    return event_fields.reduce((event, field) => {
      const [original_key, _, type, original_value] = field;
      const key =
        original_key in mapping ? mapping[original_key] : original_key;
      const value =
        type in value_type_mapping
          ? value_type_mapping[type](original_value)
          : original_value;
      event[key] = value;
      return event;
    }, {});
  });
  $("#calendar").fullCalendar("removeEventSources");
  $("#calendar").fullCalendar("addEventSource", events);
}

$(document).ready(function () {
  $("#calendar").fullCalendar({
    header: {
      left: "prev,next today",
      center: "title",
      right: "month,agendaWeek,agendaDay,listMonth",
    },
	
	themeSystem: 'jquery-ui',
	defaultView: 'agendaWeek',
    navLinks: true,
    editable: false,
	
    minTime: "7:30:00",
    maxTime: "20:00:00",
	businessHours: true,businessHours: {
	  // days of week. an array of zero-based day of week integers (0=Sunday)
	  daysOfWeek: [ 1, 2, 3, 4, 5 ],
	  
	  startTime: '08:00',
	  endTime: '18:00'
	},
	
	weekNumbers: true,
	weekNumbersWithinDays: true,
	weekNumberCalculation: 'ISO'
  });
  
  //Expect to have name.domain/view/id
  const url = document.location.toString();
  const url_feed = url.replace("view", "ics");
  $.get(url_feed, (res) => load_ics(res));
});
