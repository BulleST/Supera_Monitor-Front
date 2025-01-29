import { Component, OnDestroy, AfterViewInit, signal, ChangeDetectorRef } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import { Subscription } from 'rxjs';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { INITIAL_EVENTS, createEventId } from './event-utils';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent implements OnDestroy, AfterViewInit {
    subscription: Subscription[] = [];
    calendarVisible = signal(true);
    currentEvents = signal<EventApi[]>([]);
    calendarOptions: CalendarOptions = {
        initialView: 'Semana',
        dayHeaders: true,
        weekends: false,
        weekNumbers: true,
        expandRows: true,
        editable: true,
        showNonCurrentDates: true,
        defaultAllDay: false,
        allDaySlot: false,
        weekNumberContent: 'semana {f}',
        weekNumberFormat: {
            week: 'long',
            separator: ',',

        },
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next,today',
            center: 'title',
            right: 'dayGridDay,Semana,dayGridMonth,listWeek'
        },
        dayMaxEvents: true,
        initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
        plugins: [
            dayGridPlugin,
            interactionPlugin,
            timeGridPlugin,
            listPlugin,
        ],
        events: [
        ],
        views: {

            Semana: {
                type: 'timeGrid',
                duration: {
                    days: 7
                },
            }
        },
        
        dateClick: (arg) => this.handleDateClick(arg),
        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this)
    };

    constructor(
        private changeDetector: ChangeDetectorRef
    ) {
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    handleDateClick(arg: DateClickArg) {
        alert('date click! ' + arg.dateStr)
    }
    handleCalendarToggle() {
        this.calendarVisible.update((bool: any) => !bool);
    }

    handleWeekendsToggle() {
    }

    handleDateSelect(selectInfo: DateSelectArg) {
    }

    handleEventClick(clickInfo: EventClickArg) {
    }

    handleEvents(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }
}