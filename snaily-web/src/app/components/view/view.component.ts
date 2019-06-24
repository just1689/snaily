import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ItemService} from '../../services/item.service';
import {ItemV1} from '../../model/item-v1';
import {HttpErrorResponse} from '@angular/common/http';
import {Messages} from '../../util/Messages';
import {UserV1} from '../../model/user-v1';
import {MessageID} from '../../model/generic';
import {WS} from '../../util/ws';
import {UserState} from '../../model/state/userState';

declare var Swal: any;

@Component({
  selector: 'app-browse',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  @Input() id: string;

  private item: ItemV1 = new ItemV1();
  private users: UserV1[] = [];

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private router: Router,
  ) {
  }

  ngOnInit() {

    // Heresy
    this.id = window.location.search.split('=')[1];

    this.route.params.forEach((params: Params) => {
      if (params['id'] !== undefined) {
        this.id = params['id'];
      }
    });

    this.refresh();

    setTimeout(() => {
      WS.handler = (result) => {
        this.handleResult(JSON.parse(result));
      };
      const action = {
        action: 'subscribe',
        body: {
          entity: 'items',
          id: this.id,
        },
      };
      WS.send(JSON.stringify(action));
    }, 1000);


  }

  private handleResult(result: any): void {
    if (result.item.id !== this.id) {
      console.log('Not for this context');
      return;
    }
    this.item = result.item;
    this.users = result.users;

  }

  private refresh(): void {
    const i = new ItemV1();
    i.id = this.id;
    this.itemService.getItem(i, (result) => {
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

  public getClosedBy(): string {
    if (this.item.createdByDone === true) {
      return this.getUserFullName(this.item.createdBy);
    }

    if (this.item.waitingForDone === true) {
      return this.getUserFullName(this.item.waitingFor);
    }

    return '...';
  }


  public getUserFullName(id: string): string {
    for (const o of this.users) {
      if (o.id === id) {
        if (o.firstName === '' || o.lastName === '') {
          return o.email;
        }
        const r = o.firstName + ' ' + o.lastName;
        return r;
      }
    }
    return '?';
  }

  public close(): void {
    const r = new MessageID();
    r.id = this.item.id;
    this.itemService.closeItem(r, () => {
      this.refresh();
    }, (error) => {
      console.log(error);
    });

  }

  public canClose(): boolean {
    return (this.item.createdByDone === false && this.item.waitingForDone === false);
  }
}
