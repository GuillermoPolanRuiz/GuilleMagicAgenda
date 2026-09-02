// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://gthgbolswxesdabbtlzd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_lonFSwx-LGubgGqcltVMqA_zKSgXu_S";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// ELEMENTOS
// ==========================================

const calendar =
    document.getElementById("calendar");

const currentMonthTitle =
    document.getElementById(
        "currentMonthTitle"
    );

const previousMonthButton =
    document.getElementById(
        "previousMonth"
    );

const nextMonthButton =
    document.getElementById(
        "nextMonth"
    );

const todayButton =
    document.getElementById(
        "todayButton"
    );

const yearSelect =
    document.getElementById(
        "yearSelect"
    );

const eventModal =
    document.getElementById(
        "eventModal"
    );

const modalContent =
    document.getElementById(
        "modalContent"
    );

const calendarView =
    document.getElementById(
        "calendarView"
    );

const settingsView =
    document.getElementById(
        "settingsView"
    );

const calendarNavButton =
    document.getElementById(
        "calendarNavButton"
    );

const settingsNavButton =
    document.getElementById(
        "settingsNavButton"
    );

const settingsForm =
    document.getElementById(
        "settingsForm"
    );

const settingsMessage =
    document.getElementById(
        "settingsMessage"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


// ==========================================
// FECHA ACTUAL
// ==========================================

const today =
    new Date();


// ==========================================
// MES Y AÑO ACTUAL
// ==========================================

let currentMonth =
    today.getMonth();

let currentYear =
    today.getFullYear();


// ==========================================
// VARIABLES
// ==========================================

let selectedDate = null;

let selectedEvent = null;

let events = [];


// ==========================================
// CONFIGURACIÓN
// ==========================================

let settings = {

    precio_base: 200,

    precio_km: 0.50,

    precio_persona: 2,

    precio_hora: 50,

    cobrar_por_hora: false

};


// ==========================================
// NOMBRES
// ==========================================

const months = [

    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"

];


const weekdays = [

    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo"

];


// ==========================================
// AUTENTICACIÓN
// ==========================================

async function checkAuth() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();


    if (
        error ||
        !session
    ) {

        window.location.href =
            "login.html";

        return null;

    }


    return session;

}


// Si la sesión se cierra o expira en cualquier momento
// (por ejemplo desde otra pestaña), sacamos al usuario.

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (
            event === "SIGNED_OUT" ||
            !session
        ) {

            window.location.href =
                "login.html";

        }

    }
);


async function logout() {

    logoutButton.disabled = true;


    await supabaseClient.auth.signOut();


    window.location.href =
        "login.html";

}


// ==========================================
// INICIALIZACIÓN
// ==========================================

async function init() {

    const session =
        await checkAuth();


    if (!session) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        logout
    );


    createYearSelector();


    await loadSettings();


    await loadEvents();


    renderCalendar();


    // ======================================
    // MES ANTERIOR
    // ======================================

    previousMonthButton.addEventListener(
        "click",
        () => {

            currentMonth--;


            if (
                currentMonth < 0
            ) {

                currentMonth = 11;

                currentYear--;

                updateYearSelector();

            }


            renderCalendar();

        }
    );


    // ======================================
    // MES SIGUIENTE
    // ======================================

    nextMonthButton.addEventListener(
        "click",
        () => {

            currentMonth++;


            if (
                currentMonth > 11
            ) {

                currentMonth = 0;

                currentYear++;

                updateYearSelector();

            }


            renderCalendar();

        }
    );


    // ======================================
    // BOTÓN HOY
    // ======================================

    todayButton.addEventListener(
        "click",
        () => {

            currentMonth =
                today.getMonth();

            currentYear =
                today.getFullYear();


            updateYearSelector();


            renderCalendar();

        }
    );


    // ======================================
    // SELECTOR AÑO
    // ======================================

    yearSelect.addEventListener(
        "change",
        () => {

            currentYear =
                parseInt(
                    yearSelect.value
                );


            renderCalendar();

        }
    );


    // ======================================
    // MODAL
    // ======================================

    eventModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                eventModal
            ) {

                closeModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                eventModal.classList.contains(
                    "show"
                )
            ) {

                closeModal();

            }

        }
    );


    // ======================================
    // CONFIGURACIÓN
    // ======================================

    settingsForm.addEventListener(
        "submit",
        saveSettings
    );


    calendarNavButton.addEventListener(
        "click",
        showCalendarView
    );


    settingsNavButton.addEventListener(
        "click",
        showSettingsView
    );

}


// ==========================================
// CARGAR EVENTOS
// ==========================================

async function loadEvents() {

    const {
        data,
        error
    } = await supabaseClient

        .from("eventos")

        .select("*")

        .order(
            "fecha",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error cargando eventos:",
            error
        );

        alert(
            "No se han podido cargar los eventos.\n\n" +
            error.message
        );

        events = [];

        return;

    }


    events =
        data || [];

}


// ==========================================
// CARGAR CONFIGURACIÓN
// ==========================================

async function loadSettings() {

    const {
        data,
        error
    } = await supabaseClient

        .from("configuracion_tarifas")

        .select("*")

        .eq(
            "id",
            1
        )

        .single();


    if (error) {

        console.error(
            "Error cargando configuración:",
            error
        );

        return;

    }


    if (data) {

        settings =
            data;

    }


    updateSettingsForm();

}


// ==========================================
// FORM CONFIGURACIÓN
// ==========================================

function updateSettingsForm() {

    if (!settings) {

        return;

    }


    document.getElementById(
        "settingBase"
    ).value =
        settings.precio_base;


    document.getElementById(
        "settingKm"
    ).value =
        settings.precio_km;


    document.getElementById(
        "settingPerson"
    ).value =
        settings.precio_persona;


    document.getElementById(
        "settingHour"
    ).value =
        settings.precio_hora;


    document.getElementById(
        "settingChargeHour"
    ).checked =
        settings.cobrar_por_hora;

}


// ==========================================
// GUARDAR CONFIGURACIÓN
// ==========================================

async function saveSettings(
    event
) {

    event.preventDefault();


    const updatedSettings = {

        precio_base:
            parseFloat(
                document.getElementById(
                    "settingBase"
                ).value
            ),

        precio_km:
            parseFloat(
                document.getElementById(
                    "settingKm"
                ).value
            ),

        precio_persona:
            parseFloat(
                document.getElementById(
                    "settingPerson"
                ).value
            ),

        precio_hora:
            parseFloat(
                document.getElementById(
                    "settingHour"
                ).value
            ),

        cobrar_por_hora:
            document.getElementById(
                "settingChargeHour"
            ).checked,

        updated_at:
            new Date().toISOString()

    };


    const {
        data,
        error
    } = await supabaseClient

        .from("configuracion_tarifas")

        .update(
            updatedSettings
        )

        .eq(
            "id",
            1
        )

        .select()
        .single();


    if (error) {

        console.error(
            "Error guardando configuración:",
            error
        );

        settingsMessage.textContent =
            "No se ha podido guardar la configuración.";

        settingsMessage.style.color =
            "#b91c1c";

        return;

    }


    settings =
        data;


    settingsMessage.textContent =
        "✓ Configuración guardada correctamente.";

    settingsMessage.style.color =
        "#166534";


    setTimeout(
        () => {

            settingsMessage.textContent =
                "";

        },
        3000
    );

}


// ==========================================
// SELECTOR AÑOS
// ==========================================

function createYearSelector() {

    const actualYear =
        new Date().getFullYear();


    for (
        let year =
            actualYear - 10;

        year <=
            actualYear + 10;

        year++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            year;


        option.textContent =
            year;


        yearSelect.appendChild(
            option
        );

    }


    updateYearSelector();

}


// ==========================================
// ACTUALIZAR SELECTOR AÑO
// ==========================================

function updateYearSelector() {

    yearSelect.value =
        currentYear;

}


// ==========================================
// RENDER CALENDARIO
// ==========================================

function renderCalendar() {

    currentMonthTitle.textContent =
        `${months[currentMonth]} ${currentYear}`;


    updateYearSelector();


    calendar.innerHTML = "";


    const weekdaysElement =
        document.createElement(
            "div"
        );


    weekdaysElement.className =
        "weekdays";


    weekdays.forEach(
        weekday => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "weekday";


            element.textContent =
                weekday.substring(
                    0,
                    3
                );


            weekdaysElement.appendChild(
                element
            );

        }
    );


    calendar.appendChild(
        weekdaysElement
    );


    const daysElement =
        document.createElement(
            "div"
        );


    daysElement.className =
        "days";


    // Primer día del mes

    const firstDay =
        new Date(
            currentYear,
            currentMonth,
            1
        );


    let firstDayOfWeek =
        firstDay.getDay();


    // Domingo = 6
    // Lunes = 0

    firstDayOfWeek =
        firstDayOfWeek === 0
            ? 6
            : firstDayOfWeek - 1;


    // Espacios antes del día 1

    for (
        let i = 0;
        i < firstDayOfWeek;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "day empty";


        daysElement.appendChild(
            empty
        );

    }


    // Días del mes

    const daysInMonth =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayElement =
            createDayElement(
                day
            );


        daysElement.appendChild(
            dayElement
        );

    }


    calendar.appendChild(
        daysElement
    );

}


// ==========================================
// CREAR DÍA
// ==========================================

function createDayElement(
    day
) {

    const dayElement =
        document.createElement(
            "div"
        );


    dayElement.className =
        "day";


    // --------------------------------------
    // NÚMERO
    // --------------------------------------

    const numberElement =
        document.createElement(
            "div"
        );


    numberElement.className =
        "day-number";


    numberElement.textContent =
        day;


    dayElement.appendChild(
        numberElement
    );


    // --------------------------------------
    // FECHA
    // --------------------------------------

    const date =
        new Date(
            currentYear,
            currentMonth,
            day
        );


    const dateString =
        formatDateForDatabase(
            date
        );


    // --------------------------------------
    // EVENTOS
    // --------------------------------------

    const dayEvents =
        events
            .filter(
                event =>
                    event.fecha ===
                    dateString
            )
            .sort(
                (a, b) =>
                    (a.hora_inicio || "")
                        .localeCompare(
                            b.hora_inicio || ""
                        )
            );


    // --------------------------------------
    // HOY
    // --------------------------------------

    if (

        day ===
            today.getDate()

        &&

        currentMonth ===
            today.getMonth()

        &&

        currentYear ===
            today.getFullYear()

    ) {

        dayElement.classList.add(
            "today"
        );

    }


    // --------------------------------------
// EVENTOS
// --------------------------------------

const maxEvents = 3;


// --------------------------------------
// INDICADOR DE EVENTOS
// --------------------------------------

if (dayEvents.length > 0) {

    const eventIndicator =
        document.createElement("div");

    eventIndicator.className =
        "event-indicator";


    const icon =
        document.createElement("span");

    icon.className =
        "event-indicator-icon";

    icon.textContent =
        "✨";


    const count =
        document.createElement("span");

    count.className =
        "event-indicator-count";


    // if (dayEvents.length === 1) {

    //     count.textContent =
    //         "1 evento";

    // } else {

    //     count.textContent =
    //         `${dayEvents.length} eventos`;

    // }


    eventIndicator.appendChild(icon);

    eventIndicator.appendChild(count);

    dayElement.appendChild(
        eventIndicator
    );

}


// --------------------------------------
// EVENTOS EN ESCRITORIO
// --------------------------------------

dayEvents
    .slice(
        0,
        maxEvents
    )
    .forEach(
        event => {

            const eventElement =
                document.createElement(
                    "div"
                );


            eventElement.className =
                "calendar-event";


            eventElement.innerHTML = `

                <span class="calendar-event-time">

                    ${formatTime(
                        event.hora_inicio
                    )}

                </span>

                <span class="calendar-event-name">

                    ${escapeHtml(
                        event.nombre
                    )}

                </span>

            `;


            dayElement.appendChild(
                eventElement
            );

        }
    );


// --------------------------------------
// MÁS EVENTOS
// --------------------------------------

if (
    dayEvents.length >
    maxEvents
) {

    const more =
        document.createElement(
            "div"
        );


    more.className =
        "more-events";


    more.textContent =
        `+ ${dayEvents.length - maxEvents} más`;


    dayElement.appendChild(
        more
    );

}


    // --------------------------------------
    // CLICK
    // --------------------------------------

    dayElement.addEventListener(
        "click",
        () => {

            selectDay(
                date
            );

        }
    );


    return dayElement;

}


// ==========================================
// SELECCIONAR DÍA
// ==========================================

function selectDay(
    date
) {

    selectedDate =
        date;


    const dateString =
        formatDateForDatabase(
            date
        );


    const dayEvents =
        events.filter(
            event =>
                event.fecha ===
                dateString
        );


    if (
        dayEvents.length === 0
    ) {

        showNewEventForm();

    } else {

        showEventsForDay(
            dayEvents
        );

    }

}


// ==========================================
// MOSTRAR EVENTOS DEL DÍA
// ==========================================

function showEventsForDay(
    dayEvents
) {

    const dateText =
        formatDate(
            selectedDate
        );


    modalContent.innerHTML = `

        <div class="modal-header">

            <div>

                <h2>
                    Eventos del día
                </h2>

                <span>
                    ${dateText}
                </span>

            </div>


            <button
                class="close-modal"
                type="button"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="events-list">

            ${dayEvents
                .sort(
                    (a, b) =>
                        (a.hora_inicio || "")
                            .localeCompare(
                                b.hora_inicio || ""
                            )
                )
                .map(
                    event =>
                        createEventCard(
                            event
                        )
                )
                .join("")
            }

        </div>


        <div class="modal-buttons">

            <button
                class="button secondary"
                type="button"
                onclick="closeModal()"
            >
                Cerrar
            </button>


            <button
                class="button primary"
                type="button"
                onclick="showNewEventForm()"
            >
                + Nuevo evento
            </button>

        </div>

    `;


    openModal();

}


// ==========================================
// TARJETA EVENTO
// ==========================================

function createEventCard(
    event
) {

    return `

        <div
            class="event-card"
            onclick="showEventDetail('${event.id_evento}')"
        >

            <div class="event-card-header">

                <div class="event-card-name">

                    ${escapeHtml(
                        event.nombre
                    )}

                </div>


                <span class="event-card-type">

                    ${escapeHtml(
                        event.tipo
                    )}

                </span>

            </div>


            <div class="event-card-info">

                <div>

                    🕐
                    ${formatTime(
                        event.hora_inicio
                    )}
                    -
                    ${formatTime(
                        event.hora_fin
                    )}

                </div>


                ${
                    event.lugar
                        ? `
                            <div>
                                📍
                                ${escapeHtml(
                                    event.lugar
                                )}
                            </div>
                          `
                        : ""
                }

            </div>

        </div>

    `;

}


// ==========================================
// DETALLE EVENTO
// ==========================================

async function showEventDetail(
    eventId
) {

    selectedEvent =
        events.find(
            event =>
                event.id_evento ===
                eventId
        );


    if (!selectedEvent) {

        return;

    }


    const event =
        selectedEvent;


    const budget =
        await getBudgetForEvent(
            event.id_evento
        );


    modalContent.innerHTML = `

        <div class="modal-header">

            <div>

                <h2>
                    ${escapeHtml(
                        event.nombre
                    )}
                </h2>

                <span>
                    ${formatDateFromDatabase(
                        event.fecha
                    )}
                </span>

            </div>


            <button
                class="close-modal"
                type="button"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="budget-summary">

            <div class="budget-row">

                <span>
                    Tipo
                </span>

                <strong>
                    ${escapeHtml(
                        event.tipo
                    )}
                </strong>

            </div>


            <div class="budget-row">

                <span>
                    Horario
                </span>

                <strong>
                    ${formatTime(
                        event.hora_inicio
                    )}
                    -
                    ${formatTime(
                        event.hora_fin
                    )}
                </strong>

            </div>


            <div class="budget-row">

                <span>
                    Lugar
                </span>

                <strong>
                    ${escapeHtml(
                        event.lugar || "-"
                    )}
                </strong>

            </div>

        </div>


        ${
            budget
                ? createBudgetSummary(
                    budget
                )
                : `
                    <div class="no-events">
                        Este evento todavía no tiene presupuesto.
                    </div>
                  `
        }


        <div class="modal-buttons">

            <button
                class="button secondary"
                type="button"
                onclick="showEventsForCurrentDate()"
            >
                ← Volver
            </button>


            <button
                class="button secondary"
                type="button"
                onclick="showEditEventForm()"
            >
                Editar evento
            </button>


            <button
                class="button primary"
                type="button"
                onclick="showBudgetForm('${event.id_evento}')"
            >
                ${
                    budget
                        ? "Editar presupuesto"
                        : "+ Crear presupuesto"
                }
            </button>

        </div>

    `;


    openModal();

}


// ==========================================
// RESUMEN PRESUPUESTO
// ==========================================

function createBudgetSummary(
    budget
) {

    return `

        <div class="budget-summary">

            <div class="budget-row">

                <span>
                    Precio base
                </span>

                <strong>
                    ${formatMoney(
                        budget.precio_base
                    )}
                </strong>

            </div>


            <div class="budget-row">

                <span>
                    Kilómetros
                </span>

                <strong>
                    ${budget.km} km
                </strong>

            </div>


            <div class="budget-row">

                <span>
                    Precio/km
                </span>

                <strong>
                    ${formatMoney(
                        budget.precio_km
                    )}
                </strong>

            </div>


            <div class="budget-row">

                <span>
                    Personas
                </span>

                <strong>
                    ${budget.num_personas}
                </strong>

            </div>


            <div class="budget-row">

                <span>
                    Precio/persona
                </span>

                <strong>
                    ${formatMoney(
                        budget.precio_persona
                    )}
                </strong>

            </div>


            ${
                Number(
                    budget.precio_hora
                ) > 0
                    ? `
                        <div class="budget-row">

                            <span>
                                Precio/hora
                            </span>

                            <strong>
                                ${formatMoney(
                                    budget.precio_hora
                                )}
                            </strong>

                        </div>
                      `
                    : ""
            }


            <div class="budget-row">

                <span>
                    Duración
                </span>

                <strong>
                    ${budget.duracion} h
                </strong>

            </div>


            <div class="budget-row total">

                <span>
                    TOTAL
                </span>

                <strong>
                    ${formatMoney(
                        budget.precio_total
                    )}
                </strong>

            </div>

        </div>

    `;

}


// ==========================================
// PRESUPUESTO
// ==========================================

async function getBudgetForEvent(
    eventId
) {

    const {
        data,
        error
    } = await supabaseClient

        .from("presupuestos")

        .select("*")

        .eq(
            "id_evento",
            eventId
        )

        .maybeSingle();


    if (error) {

        console.error(
            "Error obteniendo presupuesto:",
            error
        );

        return null;

    }


    return data;

}


// ==========================================
// NUEVO EVENTO
// ==========================================

function showNewEventForm() {

    const dateText =
        formatDate(
            selectedDate
        );


    modalContent.innerHTML = `

        <div class="modal-header">

            <div>

                <h2>
                    Nuevo evento
                </h2>

                <span>
                    ${dateText}
                </span>

            </div>


            <button
                class="close-modal"
                type="button"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <form
            id="eventForm"
            onsubmit="saveEvent(event)"
        >

            <div class="form-group">

                <label for="eventName">
                    Nombre
                </label>

                <input
                    type="text"
                    id="eventName"
                    placeholder="Ej. Boda de Ana y Carlos"
                    required
                >

            </div>


            <div class="form-group">

                <label for="eventPlace">
                    Lugar
                </label>

                <input
                    type="text"
                    id="eventPlace"
                    placeholder="Ej. Hotel Ciudad"
                >

            </div>


            <div class="form-group">

                <label for="eventType">
                    Tipo de evento
                </label>

                <select
                    id="eventType"
                    required
                >

                    <option value="">
                        Selecciona un tipo
                    </option>

                    <option value="Boda">
                        Boda
                    </option>

                    <option value="Comunion">
                        Comunión
                    </option>

                    <option value="Cumpleaños">
                        Cumpleaños
                    </option>

                    <option value="Fiesta">
                        Fiesta
                    </option>

                    <option value="Otro evento">
                        Otro evento
                    </option>

                </select>

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label for="eventStart">
                        Hora inicio
                    </label>

                    <input
                        type="time"
                        id="eventStart"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="eventEnd">
                        Hora fin
                    </label>

                    <input
                        type="time"
                        id="eventEnd"
                        required
                    >

                </div>

            </div>


            <div class="modal-buttons">

                <button
                    type="button"
                    class="button secondary"
                    onclick="closeModal()"
                >
                    Cancelar
                </button>


                <button
                    type="submit"
                    class="button primary"
                >
                    Guardar evento
                </button>

            </div>

        </form>

    `;


    openModal();


    setTimeout(
        () => {

            const input =
                document.getElementById(
                    "eventName"
                );

            if (input) {

                input.focus();

            }

        },
        100
    );

}


// ==========================================
// GUARDAR EVENTO
// ==========================================

async function saveEvent(
    event
) {

    event.preventDefault();


    const start =
        document.getElementById(
            "eventStart"
        ).value;


    const end =
        document.getElementById(
            "eventEnd"
        ).value;


    if (
        end <= start
    ) {

        alert(
            "La hora de fin debe ser posterior a la hora de inicio."
        );

        return;

    }


    const eventData = {

        fecha:
            formatDateForDatabase(
                selectedDate
            ),

        nombre:
            document.getElementById(
                "eventName"
            ).value.trim(),

        lugar:
            document.getElementById(
                "eventPlace"
            ).value.trim(),

        tipo:
            document.getElementById(
                "eventType"
            ).value,

        hora_inicio:
            start,

        hora_fin:
            end

    };


    const {
        data,
        error
    } = await supabaseClient

        .from("eventos")

        .insert(
            eventData
        )

        .select()
        .single();


    if (error) {

        console.error(
            "Error guardando evento:",
            error
        );

        alert(
            "No se ha podido guardar el evento.\n\n" +
            error.message
        );

        return;

    }


    events.push(
        data
    );


    renderCalendar();


    showEventDetail(
        data.id_evento
    );

}


// ==========================================
// EDITAR EVENTO
// ==========================================

function showEditEventForm() {

    const event =
        selectedEvent;


    modalContent.innerHTML = `

        <div class="modal-header">

            <div>

                <h2>
                    Editar evento
                </h2>

                <span>
                    ${formatDateFromDatabase(
                        event.fecha
                    )}
                </span>

            </div>


            <button
                class="close-modal"
                type="button"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <form
            id="editEventForm"
            onsubmit="updateEvent(event)"
        >

            <div class="form-group">

                <label for="eventName">
                    Nombre
                </label>

                <input
                    type="text"
                    id="eventName"
                    value="${escapeAttribute(
                        event.nombre
                    )}"
                    required
                >

            </div>


            <div class="form-group">

                <label for="eventPlace">
                    Lugar
                </label>

                <input
                    type="text"
                    id="eventPlace"
                    value="${escapeAttribute(
                        event.lugar || ""
                    )}"
                >

            </div>


            <div class="form-group">

                <label for="eventType">
                    Tipo de evento
                </label>

                <select
                    id="eventType"
                    required
                >

                    ${createTypeOptions(
                        event.tipo
                    )}

                </select>

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label for="eventStart">
                        Hora inicio
                    </label>

                    <input
                        type="time"
                        id="eventStart"
                        value="${formatTime(
                            event.hora_inicio
                        )}"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="eventEnd">
                        Hora fin
                    </label>

                    <input
                        type="time"
                        id="eventEnd"
                        value="${formatTime(
                            event.hora_fin
                        )}"
                        required
                    >

                </div>

            </div>


            <div class="modal-buttons">

                <button
                    type="button"
                    class="button danger"
                    onclick="deleteEvent()"
                >
                    Eliminar
                </button>


                <button
                    type="button"
                    class="button secondary"
                    onclick="showEventDetail('${event.id_evento}')"
                >
                    Cancelar
                </button>


                <button
                    type="submit"
                    class="button primary"
                >
                    Guardar cambios
                </button>

            </div>

        </form>

    `;


    openModal();

}


// ==========================================
// ACTUALIZAR EVENTO
// ==========================================

async function updateEvent(
    event
) {

    event.preventDefault();


    const start =
        document.getElementById(
            "eventStart"
        ).value;


    const end =
        document.getElementById(
            "eventEnd"
        ).value;


    if (
        end <= start
    ) {

        alert(
            "La hora de fin debe ser posterior a la hora de inicio."
        );

        return;

    }


    const updatedData = {

        nombre:
            document.getElementById(
                "eventName"
            ).value.trim(),

        lugar:
            document.getElementById(
                "eventPlace"
            ).value.trim(),

        tipo:
            document.getElementById(
                "eventType"
            ).value,

        hora_inicio:
            start,

        hora_fin:
            end

    };


    const {
        data,
        error
    } = await supabaseClient

        .from("eventos")

        .update(
            updatedData
        )

        .eq(
            "id_evento",
            selectedEvent.id_evento
        )

        .select()
        .single();


    if (error) {

        alert(
            "No se ha podido actualizar el evento.\n\n" +
            error.message
        );

        return;

    }


    const index =
        events.findIndex(
            item =>
                item.id_evento ===
                data.id_evento
        );


    if (
        index !== -1
    ) {

        events[index] =
            data;

    }


    selectedEvent =
        data;


    renderCalendar();


    showEventDetail(
        data.id_evento
    );

}


// ==========================================
// ELIMINAR EVENTO
// ==========================================

async function deleteEvent() {

    if (!selectedEvent) {

        return;

    }


    const confirmed =
        confirm(
            "¿Seguro que quieres eliminar este evento?\n\n" +
            "También se eliminará su presupuesto."
        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } = await supabaseClient

        .from("eventos")

        .delete()

        .eq(
            "id_evento",
            selectedEvent.id_evento
        );


    if (error) {

        alert(
            "No se ha podido eliminar el evento.\n\n" +
            error.message
        );

        return;

    }


    events =
        events.filter(
            item =>
                item.id_evento !==
                selectedEvent.id_evento
        );


    selectedEvent =
        null;


    renderCalendar();


    showEventsForCurrentDate();

}


// ==========================================
// EVENTOS DEL DÍA
// ==========================================

function showEventsForCurrentDate() {

    const dateString =
        formatDateForDatabase(
            selectedDate
        );


    const dayEvents =
        events.filter(
            event =>
                event.fecha ===
                dateString
        );


    if (
        dayEvents.length
    ) {

        showEventsForDay(
            dayEvents
        );

    } else {

        closeModal();

    }

}


// ==========================================
// FORMULARIO PRESUPUESTO
// ==========================================

async function showBudgetForm(
    eventId
) {

    const event =
        events.find(
            item =>
                item.id_evento ===
                eventId
        );


    if (!event) {

        return;

    }


    selectedEvent =
        event;


    const budget =
        await getBudgetForEvent(
            eventId
        );


    modalContent.innerHTML = `

        <div class="modal-header">

            <div>

                <h2>
                    Presupuesto
                </h2>

                <span>
                    ${escapeHtml(
                        event.nombre
                    )}
                </span>

            </div>


            <button
                class="close-modal"
                type="button"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="budget-summary">

            <div class="budget-row">

                <span>
                    Precio base
                </span>

                <strong>
                    ${formatMoney(
                        settings.precio_base
                    )}
                </strong>

            </div>


            <div class="budget-row">

                <span>
                    Precio/km
                </span>

                <strong>
                    ${formatMoney(
                        settings.precio_km
                    )}
                </strong>

            </div>


            <div class="budget-row">

                <span>
                    Precio/persona
                </span>

                <strong>
                    ${formatMoney(
                        settings.precio_persona
                    )}
                </strong>

            </div>

        </div>


        <form
            onsubmit="saveBudget(event, '${eventId}')"
        >


            <div class="form-group">

                <label for="budgetKm">
                    Kilómetros
                </label>

                <input
                    type="number"
                    id="budgetKm"
                    min="0"
                    step="0.1"
                    value="${budget?.km ?? 0}"
                    required
                >

            </div>


            <div class="form-group">

                <label for="budgetPeople">
                    Nº de personas
                </label>

                <input
                    type="number"
                    id="budgetPeople"
                    min="1"
                    step="1"
                    value="${budget?.num_personas ?? 1}"
                    required
                >

            </div>


            <div class="form-group">

                <label for="budgetDuration">
                    Duración (horas)
                </label>

                <input
                    type="number"
                    id="budgetDuration"
                    min="0"
                    step="0.25"
                    value="${
                        budget?.duracion ??
                        calculateDuration(
                            event.hora_inicio,
                            event.hora_fin
                        )
                    }"
                    required
                >

            </div>


            <div class="calculated-price">

                <span
                    class="calculated-price-label"
                >
                    Precio estimado
                </span>


                <span
                    id="calculatedPrice"
                    class="calculated-price-value"
                >
                    0,00 €
                </span>

            </div>


            <div class="modal-buttons">

                <button
                    type="button"
                    class="button secondary"
                    onclick="showEventDetail('${eventId}')"
                >
                    Cancelar
                </button>


                <button
                    type="submit"
                    class="button primary"
                >
                    ${
                        budget
                            ? "Guardar cambios"
                            : "Crear presupuesto"
                    }
                </button>

            </div>

        </form>

    `;


    openModal();


    [
        "budgetKm",
        "budgetPeople",
        "budgetDuration"
    ].forEach(
        id => {

            document
                .getElementById(id)
                .addEventListener(
                    "input",
                    updateCalculatedPrice
                );

        }
    );


    updateCalculatedPrice();

}


// ==========================================
// CALCULAR PRESUPUESTO
// ==========================================

function calculateBudgetTotal(
    km,
    people,
    duration
) {

    let total =
        Number(
            settings.precio_base
        );


    total +=
        km *
        Number(
            settings.precio_km
        );


    total +=
        people *
        Number(
            settings.precio_persona
        );


    if (
        settings.cobrar_por_hora
    ) {

        total +=
            duration *
            Number(
                settings.precio_hora
            );

    }


    return total;

}


// ==========================================
// PRECIO EN TIEMPO REAL
// ==========================================

function updateCalculatedPrice() {

    const km =
        parseFloat(
            document.getElementById(
                "budgetKm"
            ).value
        ) || 0;


    const people =
        parseInt(
            document.getElementById(
                "budgetPeople"
            ).value
        ) || 0;


    const duration =
        parseFloat(
            document.getElementById(
                "budgetDuration"
            ).value
        ) || 0;


    const total =
        calculateBudgetTotal(
            km,
            people,
            duration
        );


    const calculatedPrice =
        document.getElementById(
            "calculatedPrice"
        );


    if (calculatedPrice) {

        calculatedPrice.textContent =
            formatMoney(
                total
            );

    }

}


// ==========================================
// GUARDAR PRESUPUESTO
// ==========================================

async function saveBudget(
    event,
    eventId
) {

    event.preventDefault();


    const km =
        parseFloat(
            document.getElementById(
                "budgetKm"
            ).value
        );


    const people =
        parseInt(
            document.getElementById(
                "budgetPeople"
            ).value
        );


    const duration =
        parseFloat(
            document.getElementById(
                "budgetDuration"
            ).value
        );


    const precioTotal =
        calculateBudgetTotal(
            km,
            people,
            duration
        );


    const budgetData = {

        id_evento:
            eventId,

        precio_base:
            Number(
                settings.precio_base
            ),

        km:
            km,

        precio_km:
            Number(
                settings.precio_km
            ),

        duracion:
            duration,

        num_personas:
            people,

        precio_persona:
            Number(
                settings.precio_persona
            ),

        precio_hora:
            Number(
                settings.precio_hora
            ),

        precio_total:
            precioTotal

    };


    const existingBudget =
        await getBudgetForEvent(
            eventId
        );


    let result;


    if (existingBudget) {

        result =
            await supabaseClient

                .from("presupuestos")

                .update(
                    budgetData
                )

                .eq(
                    "id_presupuesto",
                    existingBudget.id_presupuesto
                )

                .select()
                .single();

    } else {

        result =
            await supabaseClient

                .from("presupuestos")

                .insert(
                    budgetData
                )

                .select()
                .single();

    }


    if (result.error) {

        alert(
            "No se ha podido guardar el presupuesto.\n\n" +
            result.error.message
        );

        return;

    }


    showEventDetail(
        eventId
    );

}


// ==========================================
// TIPOS
// ==========================================

function createTypeOptions(
    selected
) {

    const types = [

        "Boda",
        "Comunion",
        "Cumpleaños",
        "Fiesta",
        "Otro evento"

    ];


    return types
        .map(
            type => `

                <option
                    value="${type}"
                    ${
                        type === selected
                            ? "selected"
                            : ""
                    }
                >

                    ${
                        type === "Comunion"
                            ? "Comunión"
                            : type
                    }

                </option>

            `
        )
        .join("");

}


// ==========================================
// DURACIÓN
// ==========================================

function calculateDuration(
    start,
    end
) {

    if (
        !start ||
        !end
    ) {

        return 0;

    }


    const startParts =
        start
            .substring(
                0,
                5
            )
            .split(":")
            .map(Number);


    const endParts =
        end
            .substring(
                0,
                5
            )
            .split(":")
            .map(Number);


    const startMinutes =
        startParts[0] * 60 +
        startParts[1];


    const endMinutes =
        endParts[0] * 60 +
        endParts[1];


    if (
        endMinutes <=
        startMinutes
    ) {

        return 0;

    }


    return (
        (endMinutes -
            startMinutes) /
        60
    );

}


// ==========================================
// MODAL
// ==========================================

function openModal() {

    eventModal.classList.add(
        "show"
    );

}


function closeModal() {

    eventModal.classList.remove(
        "show"
    );

    selectedEvent =
        null;

}


// ==========================================
// FECHAS
// ==========================================

function formatDateForDatabase(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


function formatDate(
    date
) {

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const year =
        date.getFullYear();


    return `${day}/${month}/${year}`;

}


function formatDateFromDatabase(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const [
        year,
        month,
        day
    ] =
        dateString.split("-");


    return `${day}/${month}/${year}`;

}


// ==========================================
// HORA
// ==========================================

function formatTime(
    time
) {

    if (!time) {

        return "";

    }


    return time.substring(
        0,
        5
    );

}


// ==========================================
// DINERO
// ==========================================

function formatMoney(
    value
) {

    return new Intl.NumberFormat(
        "es-ES",
        {
            style: "currency",
            currency: "EUR"
        }
    ).format(
        Number(value) || 0
    );

}


// ==========================================
// SEGURIDAD HTML
// ==========================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}


// ==========================================
// VISTAS
// ==========================================

function showCalendarView() {

    calendarView.style.display =
        "block";

    settingsView.classList.remove(
        "show"
    );


    calendarNavButton.classList.add(
        "active"
    );

    settingsNavButton.classList.remove(
        "active"
    );

}


async function showSettingsView() {

    calendarView.style.display =
        "none";

    settingsView.classList.add(
        "show"
    );


    calendarNavButton.classList.remove(
        "active"
    );

    settingsNavButton.classList.add(
        "active"
    );


    await loadSettings();

}


// ==========================================
// INICIAR
// ==========================================

init();