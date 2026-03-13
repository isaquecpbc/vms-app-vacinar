import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, Platform } from '@ionic/angular';
import { ConnectionStatusService } from './connection-status.service';
import { finalize, forkJoin, from, Observable, of, switchMap } from 'rxjs';
import { StoredRequestRepository } from '../repositories/stored-request.repository';
import { StoredRequest } from '../models/stored-request.model';
import { Http, HttpOptions } from '@capacitor-community/http';

@Injectable({
  providedIn: 'root'
})
export class ApiManagerService {

  disconnectSubscription: any;
  connectSubscription: any;
  networkStatus = true;
  requestSubscriber: any;
  mutex = true;

  constructor(
    private statusConnection: ConnectionStatusService,
    private platform: Platform,
    private storedRequestRepository: StoredRequestRepository,
    ) {
        this.platform.ready().then(() => {
          this.checkInternetConnection();
        });
   }

   private checkInternetConnection() {
    this.statusConnection.statusConexao
      .subscribe(
        online => {
          if(online) {
            this.networkStatus = true;
            if (this.mutex) {
              this.mutex = false;
              this.requestSubscriber = this.checkForUnCompleteAPI().subscribe();
            }
          }
          else {
            this.mutex = true;
            this.networkStatus = false;
          }

        }
      )
  }

  checkForUnCompleteAPI(): Observable <any> {
    return from(this.storedRequestRepository.getAllUnComplete()).pipe(
      switchMap((requests: StoredRequest[]) => {
        if (requests && requests.length > 0) {
          return this.sendRequests(requests).pipe(
            finalize(() => {
              this.completeAllRequests().then(async () => {
                this.requestSubscriber.unsubscribe();
                const stored = await this.storedRequestRepository.getAll(); // use the db name that you prefer
              });
            })
          );
        } else {
          return of(false);
        }
      })
    )
  }

  completeAllRequests(): Promise <any> {
    return new Promise((resolve, reject) => {
      this.storedRequestRepository.getAllUnComplete()
      .then((requests: StoredRequest[]) => {
          const arrUpdates: Array<string> = []
          requests.map(req => arrUpdates.push(`update aplicacao set completed = 1 where id = '${req.id}'`))
          resolve(this.storedRequestRepository.updateAllComplete(arrUpdates));
        });
      })
  }

  storeCallAndRespond(method: string, url: string, header: string, data?: string): Promise <any> {
    return new Promise(async (resolve, reject) =>  {
      const action: StoredRequest = {
        url: url,
        type: method,
        data: data ? data : undefined,
        time: new Date().getTime(),
        completed: false,
        response: undefined,
        header: header,
        id: this.storedRequestRepository.getStringId()
      };

      const Store = await this.storedRequestRepository.create(action);
      await this.repeatRequest(action).then((response) => {
        console.log('Response', response);
        resolve(response);
      })
    });
  }

  async repeatRequest(action: StoredRequest) {
    return new Promise(async (resolve, reject) => {
        let response;
        if (!this.networkStatus) {
          // No Internet
          resolve(action.data);
        } else {
          // Internet is there
          if (action.type === 'GET') {
            const options: HttpOptions = {
              method: 'GET',
              url: action.url,
              params: {}
            };
            response = await Http.get(options);
          } else {
            const options: HttpOptions = {
              method: action.type,
              url: action.url,
              params: {},
              data: action.data
            };
            response = await Http.get(options);
          }
          this.updateActionObject(action, response);
          resolve(response);
        }
    });
  }

  updateActionObject(action: StoredRequest, response: any) {
    this.storedRequestRepository.getById(action.id)
      .then(async (storedOperations: StoredRequest) => {
        storedOperations.completed = true;
        storedOperations.response = JSON.stringify(response);
        return await this.storedRequestRepository.update(storedOperations);
      })
      .catch(async (storedOperations: StoredRequest) => {
        console.log('catch', action);
        action.completed = true;
        action.response = JSON.stringify(response);
        return await this.storedRequestRepository.create(action);
      })
  }

  sendRequests(requests: StoredRequest[]) {
    console.log('Req Called')
    let obs = [];
    let oneObs;
    for (let request of requests) {
      if (!request.completed) {
        if (request.type === 'GET') {
          const options: HttpOptions = {
            method: 'GET',
            url: request.url,
            params: {}
          };
          oneObs = Http.get(options);
        } else {
          const options: HttpOptions = {
            method: request.type,
            url: request.url,
            params: {},
            data: request.data
          };
          oneObs = Http.get(options);
        }
        console.log('Array res', oneObs);
        obs.push(oneObs);
      }
    }
    return forkJoin(obs);
  }

  ngOnDestroy() {
    this.disconnectSubscription.unsubscribe();
    this.connectSubscription.unsubscribe();
  }
}
