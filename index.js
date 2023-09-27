const selectDirectionCall = document.getElementById("selectDirectionCall")
const whoCall = document.getElementById("whoCall")
const extensionId = document.getElementById("extensionId")
const agentId = document.getElementById("agentId")
const selectAgentName = document.getElementById("selectAgentName")
const buttonSubmmit = document.getElementById("button-submmit")
const menuAvanzado = document.getElementById("menuAvanzado")
const buttonAdvanced = document.getElementById("buttonAdvanced")

window.addEventListener("load", () => {

    fetch('DB.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(element => {
                console.log(element)
                let option = document.createElement('option');
                option.value = element.agentName;
                option.textContent = element.agentName;
                selectAgentName.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
})

let datos
buttonSubmmit.addEventListener("click", () => {
    fetch('DB.json')
        .then(response => response.json())
        .then(data => {
            datos = data
            arrayAtributos = ["callDirection", "WhoCall", "extension", "agenteId", "agentName"]
            valores = [selectDirectionCall.value, whoCall.value, extensionId.value, agentId.value, selectAgentName.value]
            for (let i = 0; i < arrayAtributos.length; i++) {
                if (valores[i] != "" && valores[i] != "todos") {
                    datos = buscarEnJSON(datos, arrayAtributos[i], valores[i])
                }
            }
            datos = filtroFecha(datos)
            const table1 = $("#Table1").DataTable();
            table1.clear().draw();
            table1.rows.add(datos).draw();
            if (menuAvanzado.classList.contains('show')) {
                // Si tiene la clase "show", la eliminamos para ocultar el elemento
                buttonAdvanced.click()
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
})
$('#Table1').DataTable({
    language: {
        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
    },
    columnDefs: [
        {
            target: [7, 8],
            searchable: false,
            render: function (data, type, row) {
                const fecha = new Date(data);
                const dia = fecha.getDate().toString().padStart(2, '0');
                const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                const año = fecha.getFullYear();
                const horas = fecha.getHours().toString().padStart(2, '0');
                const minutos = fecha.getMinutes().toString().padStart(2, '0')

                const fechaFormateada = `${dia}/${mes}/${año} ${horas}:${minutos}`;

                return fechaFormateada
            }
        },
        {
            target: 6,
            searchable: false,
            render: function (data, type, row) {
                return milisegundosAMinutos(data) + " min"
            }
        },
        {
            target: -1,
            searchable: false,
            render: function (data, type, row) {
                const accion = `<button class="btn btn-primary mb-1 d-block m-auto" onclick='playRecord("${row.ID}")' title="Abrir documento"><i class="gg-play-button-o"></i></button>
                <button onclick='descargarArchivo("${row.ID}")' class="btn btn-primary d-block m-auto" title="Copiar Documento"><i class="gg-software-download mx-1 "></i></button>`
                return accion
            }
        }
    ],
    data: datos,
    columns: [
        { data: 'ID', title: 'ID' },
        { data: 'fileName', title: 'Nombre del archivo' },
        { data: 'WhoCall', title: 'Número entrante' },
        { data: 'extension', title: 'Extensión' },
        { data: 'agenteId', title: 'Id del agente' },
        { data: 'agentName', title: 'Nombre del agente' },
        { data: 'duration', title: 'Duración' },
        { data: 'Start', title: 'Inicio' },
        { data: 'End', title: 'Fin' },
        { data: 'button', title: 'Acciones' }
    ],
    scrollX: true,
    createdRow: function (row, data, dataIndex) {
        $(row).find("td").addClass("align-middle"); // Agregar la clase de Bootstrap
    },
});



function buscarEnJSON(data, atributo, filtro) {
    // Filtramos el JSON para obtener los resultados que coincidan con la búsqueda
    var resultados = data.filter(function (item) {
        // Comprobamos si el nombre, categoría o precio coincide con la búsqueda
        return (
            item[atributo].toLowerCase().includes(filtro.toLowerCase())
        );
    });

    // Devolvemos los resultados
    return resultados;
}

function filtroFecha(data) {
    let startDate = document.getElementById("inputStartDate").value;
    let endDate = document.getElementById("inputEndDate").value;

    // Dividir las fechas en año, mes y día
    const startDateParts = startDate.split("-");
    const endDateParts = endDate.split("-");

    // Restar 1 al mes (porque en JavaScript los meses van de 0 a 11)
    const startYear = parseInt(startDateParts[0]);
    const startMonth = parseInt(startDateParts[1]) - 1;
    const startDay = parseInt(startDateParts[2]);
    const endYear = parseInt(endDateParts[0]);
    const endMonth = parseInt(endDateParts[1]) - 1;
    const endDay = parseInt(endDateParts[2]);

    const filteredData = data.filter((item) => {
        const itemDate = new Date(item.Start);
        return itemDate >= new Date(startYear, startMonth, startDay) &&
            itemDate <= new Date(endYear, endMonth, endDay, 24, 0, 0);
    });

    return filteredData;
}
function milisegundosAMinutos(milisegundos) {
    const minutos = milisegundos / 60000;
    return minutos.toFixed(2); // Limita a 2 decimales
}

const audio = document.getElementById('playRecord');
function playRecord(archivo) {
    audio.src = "./Audios/" + archivo + ".mp3"
    if (audio.classList.contains('d-none')) {
        audio.classList.remove('d-none')
        audio.play();  // Reproducir si está pausado
    } else {
        audio.play();
    }

}

function descargarArchivo(name) {
    const urlArchivo = "./Audios/" + name + ".mp3"; // Reemplaza con la URL del archivo

    // Crea un elemento 'a' invisible
    const enlace = document.createElement('a');
    enlace.href = urlArchivo;
    enlace.download = name;

    // Añade el elemento 'a' al cuerpo del documento
    document.body.appendChild(enlace);

    // Simula un clic en el enlace para iniciar la descarga
    enlace.click();

    // Elimina el elemento 'a' del cuerpo del documento
    document.body.removeChild(enlace);
}