import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ItemService} from '../../services/item.service';
import {ActivatedRoute} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {Messages} from '../../util/Messages';
import {ItemV1} from '../../model/item-v1';
import {UserV1} from '../../model/user-v1';
import {WS} from '../../util/ws';
import {UserState} from '../../model/state/userState';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private createdByMe: ItemV1[] = [];
  private waitingForMe: ItemV1[] = [];
  private users: UserV1[] = [];
  private loading = true;

  constructor(private route: ActivatedRoute, private router: Router, private itemService: ItemService) {

  }

  ngOnInit() {
    this.refresh();

    setTimeout(() => {
      WS.handler = (result) => {
        this.handleResult(JSON.parse(result));
      };
      const action = {
        action: 'subscribe',
        body: {
          entity: 'home',
          id: UserState.getMyID(),
        },
      };
      WS.send(JSON.stringify(action));
    }, 1000);

  }


  private refresh() {
    this.itemService
      .getMyItems((result) => {
          this.handleResult(result);
        }, (err: HttpErrorResponse) => {
          if (err.status === 403) {
            Messages.AccessDenied();
            this.router.navigate(['./login']);
            return;
          }
        }
      );
  }

  public handleResult(result) {
    this.users = result.users;
    this.updateLists(result.waitingForMe, result.createdByMe);
    this.loading = false;

  }


  public updateLists(waiting: ItemV1[], created: ItemV1[]) {
    for (const a of waiting) {
      const index = this.indexOf(this.waitingForMe, a.id);
      if (index === -1) {
        this.waitingForMe.push(a);
      } else {
        this.waitingForMe[index] = a;
      }
    }

    for (const a of created) {
      const index = this.indexOf(this.createdByMe, a.id);
      if (index === -1) {
        this.createdByMe.push(a);
      } else {
        this.createdByMe[index] = a;
      }
    }

  }

  private indexOf(arr: ItemV1[], id: string): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        return i;
      }
    }
    return -1;
  }


  private idInArr(arr: ItemV1[], id: string): boolean {
    for (const a of arr) {
      if (a.id === id) {
        return true;
      }
    }
    return false;
  }


  public getUserFullName(id: string): string {
    if (UserState.getMyID() === id) {
      return 'You';
    }

    for (const o of this.users) {
      if (o.id === id) {
        if (o.firstName === '' || o.lastName === '') {
          return o.email;
        }
        const r = this.first(o.firstName) + ' ' + o.lastName;
        return r;
      }
    }
    return '?';
  }

  private first(s: string): string {
    if (s == null || s.length === 0) {
      return '';
    }
    return s.substring(0, 1) + '.';
  }

  public getRowClass(i: ItemV1): string {
    if (i.waitingForDone || i.createdByDone) {
      return 'table-secondary';
    }
    return '';
  }


}
