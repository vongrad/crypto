import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from 'rxjs/Observable';
import {CcResponse} from '../model/cc-response';

@Injectable()
export class SocketService {

    private readonly URL = 'https://streamer.cryptocompare.com/';

    private readonly EVENT_LOAD_COMPLETE = 'LOADCOMPLETE';

    private socket;

    public init(): void {
        this.socket = io.connect(this.URL);
    }

    /**
     * Subscribe to a live feed of current crypto-currency rates
     * @param subscriptions
     */
    public subscribe(subscriptions: string[]): void {
        this.socket.emit('SubAdd', {'subs': subscriptions});
    }

    /**
     * Unsubscribe from a live feed of current crypto-currency rates
     * @param subscriptions
     */
    public unsubscribe(subscriptions: string[]): void {
        this.socket.emit('SubRemove', subscriptions);
    }

    public onMessage(): Observable<CcResponse> {
        return new Observable<CcResponse>(observer => {
            this.socket.on('m', (data: string) => {
                const message = data.split('~');
                if (message[1] !== this.EVENT_LOAD_COMPLETE) {
                    observer.next(new CcResponse(data));
                }
            });
        });
    }
}
