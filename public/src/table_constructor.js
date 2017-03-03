/**
 * Created by sinires on 02.03.17.
 */

function redrawTable(data) {
    var table = document.getElementById("table_data"),
        content = "";

    if(!data && !data.length) return;

    data.forEach(
        function(field) {
            if (!field && !field.length) return;
            content +='<tr>';
            field.forEach(
                function(cell) {
                    content+= '<td class="text-style">';
                    content+= cell;
                    content+= '</td>';
                }
            );
            content +='</tr>'
        }
    );

    table.innerHTML = content;
    updateStyle();
}

redrawTable(string2array(testString))