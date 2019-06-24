import {UserState} from '../model/state/userState';

export class WS {
  static socket;
  static connected = false;

  static getWSUrl(): string {
    let url = '';
    if (window.location.protocol === 'https:') {
      url = 'wss://';
    } else {
      url = 'ws://';
    }
    url += window.location.host + '/ws/entity-sync/', UserState.getMyKey();
    return url;
  }

  static send(msg: string) {
    try {
      WS.socket.send(msg);
    } catch (e) {
      this.SetupFromScratch();
      setTimeout(() => {
        WS.send(msg);
      }, 1000);
    }
  }

  static handler(x: any) {
    console.log('No handler...');
    console.log(x);
  }

  static SetupFromScratch() {
    WS.Setup(WS.getWSUrl(), UserState.getMyKey());
  }

  static Setup(url: string, key: string) {
    WS.socket = new WebSocket(url);

    WS.socket.onopen = function (e) {
      WS.connected = true;
      // console.log('[open] Connection established, send -> server');
      const action = {
        action: 'secret',
        body: key,
      };
      WS.socket.send(JSON.stringify(action));
    };

    WS.send = (msg: string) => {
      try {
        WS.socket.send(msg);
      } catch (e) {
        this.SetupFromScratch();
        setTimeout(() => {
          WS.send(msg);
        }, 1000);
      }

    };

    WS.socket.onmessage = function (event) {
      WS.handler(event.data);
    };

    WS.socket.onclose = function (event) {
      WS.connected = false;
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log('[close] Connection died');
      }
    };

    WS.socket.onerror = function (error) {
      console.log(`[error] ${error.message}`);
    };
  }
}
