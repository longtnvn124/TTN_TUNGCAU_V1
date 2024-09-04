import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DDMMYYYYDateFormatValidator, EmailCheckValidator, PhoneNumberValidator} from '@core/utils/validators';
import {debounceTime, distinctUntilChanged, mergeMap, Observable, Subject, Subscription, takeUntil} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {NewContestant, ThiSinhService} from '@shared/services/thi-sinh.service';
import {AuthService} from '@core/services/auth.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {
  DATA_UNIT_START_TEST, DATA_UNIT_START_TEST_SUPHAM,
  KEY_NAME_CONTESTANT_EMAIL,
  KEY_NAME_CONTESTANT_ID,
  KEY_NAME_SHIFT_ID
} from '@shared/utils/syscat';


interface EmailChecker {
  validateEmailcheckContestant(email: string): Observable<number>;
}

class EmailValidator {
  private _error: boolean;
  private _checking: boolean;
  private _checked: boolean;
  private _contestantId: number;
  private _checker: EmailChecker;
  private _openFormDetail: boolean;
  private subscription: Subscription = new Subscription();

  constructor(
    formControl: AbstractControl,
    destroy$: Subject<string>,
    checker: EmailChecker
  ) {
    this._checker = checker;
    this._checking = false;
    this._checked = false;
    this._error = false;
    this._openFormDetail = false;
    this._contestantId = 0;

    formControl.valueChanges.pipe(
      takeUntil(destroy$),
      filter(() => formControl.valid),
      debounceTime(500),
      // map(value => value ? value : '')
    ).subscribe(value => {
      this._checked = false;
      if (value) {
        formControl.setValue(value, {emitEvent: false});
      }
    });

    formControl.valueChanges.pipe(
      takeUntil(destroy$),
      filter(() => formControl.valid),
      debounceTime(1000),
      distinctUntilChanged(),
      // map(value => value ? value : '')
    ).subscribe((email: string) => this._isEmailExistFn(email));
    destroy$.subscribe(() => {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    });
  }

  get checked(): boolean {
    return this._checked;
  }

  get onChecking(): boolean {
    return this._checking;
  }

  get contestantId(): number {
    return this._contestantId;
  }

  get error(): boolean {
    return this._error;
  }

  get openFormDetail(): boolean {
    return this._openFormDetail;
  }

  get isContestantIdEmpty(): boolean {
    return !Boolean(this._contestantId);
  }

  private _isEmailExistFn(newValue: string) {
    this._error = false;
    this._checked = false;
    this._checking = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this._checker.validateEmailcheckContestant(newValue).subscribe({
      next: (contestantId: number) => {
        this._contestantId = contestantId;
        this._checking = false;
        this._checked = true;
        this._openFormDetail = contestantId === 0;
      },
      error: () => {
        this._checking = false;
        this._checked = false;
        this._error = true;
      }
    });
  }
}

@Component({
  selector: 'app-contestant',
  templateUrl: './contestant.component.html',
  styleUrls: ['./contestant.component.css']
})
export class ContestantComponent implements OnInit, OnDestroy {

  formGroup: FormGroup = this.fb.group({
    full_name: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(1)]],
    name: [''],
    phone: ['', [Validators.required, PhoneNumberValidator, Validators.maxLength(12), Validators.minLength(6)]],
    email: ['', [Validators.required, EmailCheckValidator, Validators.maxLength(200), Validators.minLength(1)]],
    dob: ['', [Validators.required, DDMMYYYYDateFormatValidator]],
    sex: ['',[Validators.required]],
    school: ['',],
    people_classify: [0],//0: sinh viên, 1: cán bộ
    class: [''],
    units: [''],
    donvi:['',[Validators.required]]

  });

  schools =DATA_UNIT_START_TEST_SUPHAM;

  destroy$: Subject<string> = new Subject<string>();

  emailValidator: EmailValidator;

  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private thiSinhService: ThiSinhService,
    private router: Router,
    private auth: AuthService,
    private activeRouter: ActivatedRoute,
  ) {
    const formControlEmail: AbstractControl = this.formGroup.get('email');
    this.emailValidator = new EmailValidator(formControlEmail, this.destroy$, thiSinhService);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formGroup.controls;
  }

  ngOnInit(): void {
    const params: ParamMap = this.activeRouter.snapshot.queryParamMap;
    const object = params.has('code') ? this.auth.decryptObjectData(params.get('code')) : null;
    if (object !== null) {
      this.formGroup.get('email').setValue(object['email_user']);
      this.auth.setOption(KEY_NAME_SHIFT_ID, object['shift_id']);
    }

  }

  changeUserSex(value: 'nam' | 'nu') {
    this.f['sex'].setValue(value);
  }

  changePeopleClassify(value: 1 | 0) {
    this.f['people_classify'].setValue(value);
  }

  assignContestantInfo() {
    this.isLoading = true;
    this.f['full_name'].setValue(this.f['full_name'].value.trim());
    this.f['name'].setValue(this.f['full_name'].value.split(' ').pop());
    const newContestant: NewContestant = JSON.parse(JSON.stringify(this.formGroup.value));
    newContestant.dob = newContestant.dob.split('/').reverse().join('/'); /*convert dd/mm/yyyy to yyyy/mm/dd format*/
    this.thiSinhService.assignNewContestant(newContestant).pipe(mergeMap(() => this.thiSinhService.validateEmailcheckContestant(this.f['email'].value))).subscribe({
      next: (id: number) => {
        if (id) {
          this.saveContestantInfo({id, email: this.formGroup.get('email').value});
          this.goToTest(false);
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  goToTest(saveLastContestantInfo: boolean = true) {
    if (saveLastContestantInfo) {
      this.saveContestantInfo({id: this.emailValidator.contestantId, email: this.formGroup.get('email').value});
    }
    void this.router.navigate(['/test/panel']);
  }

  private saveContestantInfo(info: { id?: number, email?: string }) {
    if (info.id) {
      this.auth.setOption(KEY_NAME_CONTESTANT_ID, info.id);
    }
    if (info.email) {
      this.auth.setOption(KEY_NAME_CONTESTANT_EMAIL, info.email);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next('completed');
    this.destroy$.complete();
  }


}
