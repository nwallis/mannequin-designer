var app = app || {};

app.helpers = {
    export_to_scenario_json: function(graph) {

        var export_data = {
            "starting_state": "not_yet_set",
            "states": {}
        };

        var graph_cells = graph.getCells();

        for (var cell_count = 0; cell_count < graph_cells.length; cell_count++) {
            var cell = graph_cells[cell_count];
            if (cell.get('type') == 'qad.Question') {

                //check that the name of the state hasn't been used already - handle this when state names are edited, but also do it here

                //based on the questions name, add it to the export_data object
            }
        }
    }
}
