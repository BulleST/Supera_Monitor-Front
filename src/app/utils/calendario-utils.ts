import { Injectable } from '@angular/core'
import { BehaviorSubject, lastValueFrom } from 'rxjs'
import {
    Evento,
    EventoCancelamentoRequest,
    EventoTipo,
} from '../models/evento.model'
import { EventoService } from '../services/evento.service'
import moment from 'moment'
import { Feriado } from '../models/feriado.model'
import { RequestResponse } from '../helpers/request-response.interface'
import { PseudoEvento } from '../models/reposicao.model'
import { MyMap } from './map'
import { EventoOficinaRequest } from '../models/evento-oficina.model'
import { EventoReuniaoRequest } from '../models/evento-reuniao.model'
import { EventoAulaRequest } from '../models/evento-aula.model'

@Injectable({
    providedIn: 'root',
})
export class CalendarioUtils {
    feriados: Feriado[] = []

    constructor(private service: EventoService) {

        this.service.feriados.subscribe((res) => (this.feriados = res))

    }

    weekOfYear(date: Date) {
        const startOfYear = new Date(date.getFullYear(), 0, 1)
        startOfYear.setDate(startOfYear.getDate() + (startOfYear.getDay() % 7))
        let weekOfYear = Math.round(
            (date.getTime() - startOfYear.getTime()) / (7 * 24 * 3600 * 1000),
        )

        if (date.getMonth() == 11) {
            weekOfYear += 1
        }

        return weekOfYear
    }

    getTextColor(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        var rgb = result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : {
                r: 0,
                g: 0,
                b: 0,
            }
        return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 > 180
            ? '#2e2e2e'
            : '#fff'
    }

    eventRandomId() {
        let length = 5
        let result = ''
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        const charactersLength = characters.length
        let counter = 0
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
            counter += 1
        }
        return result
    }

    getEventStyles(item: Evento): {
        backgroundColor: string
        textColor: string
        borderColor: string
        zIndex: number
    } {
        const MEETING_COLOR = '#F37435'
        const DEFAULT_COLOR = '#2E2E2E'
        const DIM_COLOR = '#E6E6E7';

        let backgroundColor = DEFAULT_COLOR
        let borderColor = DEFAULT_COLOR
        let textColor = this.getTextColor(backgroundColor)
        let zIndex = 0;

        switch (item.evento_Tipo_Id) {
            case EventoTipo.Reuniao:
                (backgroundColor = MEETING_COLOR),
                    (borderColor = MEETING_COLOR),
                    (textColor = this.getTextColor(MEETING_COLOR))
                break
            default:
                backgroundColor = item.corLegenda ?? item?.professores[0]?.corLegenda ?? DEFAULT_COLOR
                borderColor = backgroundColor
                textColor = this.getTextColor(backgroundColor)
                break
        }

        // Lowers opacity, keeps color
        // if (item.active === false) {
        //     backgroundColor = this.dimHexToRgba(backgroundColor, 1, 0.25)
        //     borderColor = this.dimHexToRgba(borderColor, 1, 0.25)
        //     textColor = this.dimHexToRgba(textColor, 1, 0.25)
        // }

        // Solid dim color (gray)
        if (item.active === false) {
            backgroundColor = DIM_COLOR;
            borderColor = DIM_COLOR;
            textColor = this.getTextColor(backgroundColor)
            zIndex = -100;
        }

        return {
            backgroundColor,
            borderColor,
            textColor,
            zIndex,
        }
    }

    getEventoTipo(evento: Evento) {
        if (evento.evento_Tipo_Id == EventoTipo.Aula) return 'aula'
        else if (evento.evento_Tipo_Id == EventoTipo.AulaZero) return 'aula zero'
        else if (evento.evento_Tipo_Id == EventoTipo.AulaExtra) return 'aula'
        else if (evento.evento_Tipo_Id == EventoTipo.Superacao) return 'superação'
        else if (evento.evento_Tipo_Id == EventoTipo.Oficina) return 'oficina'
        else if (evento.evento_Tipo_Id == EventoTipo.Reuniao) return 'reunião'
        else return 'evento'
    }

    request(evento: Evento) {
        evento.data = new Date(evento.data)
        switch (evento.evento_Tipo_Id) {
            case EventoTipo.Aula:
                return this.requestAulaTurma(evento)
            case EventoTipo.Reuniao:
                return this.requestReuniao(evento)
            case EventoTipo.Oficina:
                return this.requestOficina(evento)
            default:
                return this.requestAulaTurma(evento)
        }
    }

    requestAulaTurma(evento: Evento) {
        var request: EventoAulaRequest = MyMap(evento, new EventoAulaRequest())
        request.alunos = evento.alunos.map((x) => x.aluno_Id)
        request.professores = evento.professor_Id ? [evento.professor_Id] : []
        request.perfilCognitivo = evento.perfilCognitivo.map((x) => x.id)
        request.sala_Id = request.sala_Id ?? 13 // online;

        if (evento.id == PseudoEvento.EventoId)
            return lastValueFrom(this.service.createAulaTurma(request))
        return lastValueFrom(this.service.editAulaTurma(request))
    }

    requestReuniao(evento: Evento) {
        var request = MyMap(evento, new EventoReuniaoRequest())
        request.alunos = evento.alunos.map((x) => x.aluno_Id)
        request.professores = evento.professores.map((x) => x.professor_Id)
        request.sala_Id = request.sala_Id ?? 14 // professores;

        if (evento.id == PseudoEvento.EventoId)
            return lastValueFrom(this.service.createReuniao(request))
        return lastValueFrom(this.service.editReuniao(request))
    }

    requestOficina(evento: Evento) {
        var request = MyMap(evento, new EventoOficinaRequest())
        request.alunos = evento.alunos.map((x) => x.aluno_Id)
        request.professores = evento.professores.map((x) => x.professor_Id)
        request.sala_Id = request.sala_Id ?? 13 // online;
        if (evento.id == PseudoEvento.EventoId)
            return lastValueFrom(this.service.createOficina(request))
        return lastValueFrom(this.service.editOficina(request))
    }

    formatDate(date: Date) {
        return moment(date).format('DD/MM/YYYY HH:mm')
    }

}
