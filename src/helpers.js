var app = app || {};

app.helpers = {
    export_to_scenario_json: function(graph) {

        var export_data = {
            "starting_state": "not_yet_set",
            "states": {}
        };

        var graph_cells = graph.getCells();

        for (var cell_count = 0; cell_count < graph_cells.length; cell_count++) {
            var state = graph_cells[cell_count];
            if (state.get('type') == 'qad.Question') {

                export_data.states[state.id] = {
                    "obs": {},
                    "triggers": {},
                    "modifiers": {}
                };

                var state_triggers = state.get('triggers');
                for (var trigger_count = 0; trigger_count < state_triggers.length; trigger_count++) {
                    var trigger = state_triggers[trigger_count];
                    export_data.states[state.id].triggers[trigger.id] = trigger.get('trigger_data');
                }
                //iterate the triggers and add them to the triggers object

                var state_modifiers = state.get('options');
                //iterate the modifiers and add them to the modifiers object

            }
        }

        console.log(export_data);

    }
}
