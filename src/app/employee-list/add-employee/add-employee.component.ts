import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../services/employee.service';
import moment from 'moment';
import { CONSTANT } from '../../../constant';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss'],
})
export class AddEmployeeComponent implements OnInit {
  jobTitles = CONSTANT.JOB_TITLES;
  addUpdateEmployeForm: FormGroup;
  addUpdate: any;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.addUpdateEmployeForm = this.fb.group({
      id: [],
      name: ['', Validators.required],
      jobTitle: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18), Validators.max(70)]],
      startDate: ['', [Validators.required, this.startDateValidator()]],
      endDate: ['', this.endDateValidator()],
      isCurrentlyWorking: [false],
    });

    this.addUpdateEmployeForm
      .get('isCurrentlyWorking')
      ?.valueChanges.subscribe((value) => {
        this.toggleEndDateValidation();
      });

    this.addUpdateEmployeForm
      .get('startDate')
      ?.valueChanges.subscribe(() => this.validateDates());

    this.addUpdateEmployeForm
      .get('endDate')
      ?.valueChanges.subscribe(() => this.validateDates());
  }

  ngOnInit(): void {
    this.addUpdate = this.data.action === 'view' ? 'Update' : 'Add';

    if (this.data.action === 'view' && this.data.formValue) {
      this.addUpdateEmployeForm.patchValue(this.data.formValue);
      this.addUpdateEmployeForm.patchValue({
        isCurrentlyWorking: this.data.formValue.endDate === 'Currently Working',
      });
    }

    this.toggleEndDateValidation();
  }

  onInputAge(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const filteredValue = inputElement.value.replace(/[^0-9]/g, '');

    if (inputElement.value !== filteredValue) {
      inputElement.value = filteredValue;
    }

    this.addUpdateEmployeForm
      .get('age')
      ?.setValue(filteredValue, { emitEvent: false });
  }

  toggleEndDateValidation() {
    const endDateControl = this.addUpdateEmployeForm.get('endDate');
    const isCurrentlyWorking =
      this.addUpdateEmployeForm.get('isCurrentlyWorking')?.value;

    if (isCurrentlyWorking) {
      endDateControl?.clearValidators();
      endDateControl?.setValue('');
    } else {
      endDateControl?.setValidators(this.endDateValidator());
    }
    endDateControl?.updateValueAndValidity();
  }

  startDateValidator() {
    return (control: AbstractControl) => {
      const startDate = moment(control.value);
      if (!startDate.isValid()) {
        return null;
      }
      if (startDate.isAfter(moment())) {
        return { startDateInFuture: true };
      }
      return null;
    };
  }

  endDateValidator() {
    return (control: AbstractControl) => {
      const endDate = moment(control.value);
      if (!endDate.isValid()) {
        return null;
      }
      if (endDate.isAfter(moment())) {
        return { endDateInFuture: true };
      }
      return null;
    };
  }

  validateDates() {
    const startDateControl = this.addUpdateEmployeForm.get('startDate');
    const endDateControl = this.addUpdateEmployeForm.get('endDate');
    const startDate = moment(startDateControl?.value);
    const endDate = moment(endDateControl?.value);

    if (
      startDate.isValid() &&
      endDate.isValid() &&
      endDate.isBefore(startDate)
    ) {
      endDateControl?.setErrors({ endDateBeforeStartDate: true });
    } else {
      if (endDateControl?.hasError('endDateBeforeStartDate')) {
        endDateControl.setErrors(null);
      }
    }
  }

  onSave() {
    if (this.addUpdateEmployeForm.valid) {
      this.addUpdateEmployeForm.value.endDate = this.addUpdateEmployeForm.value
        .isCurrentlyWorking
        ? 'Currently Working'
        : this.addUpdateEmployeForm.value.endDate;
      const apiCalling: Observable<any> =
        this.addUpdateEmployeForm && this.addUpdateEmployeForm.value.id
          ? this.employeeService.updateEmployee(this.addUpdateEmployeForm.value)
          : this.employeeService.addEmployee(this.addUpdateEmployeForm.value);

      apiCalling.subscribe({
        next: (id: number) => {
          this.snackBar.open('Employee saved successfully!', 'Close');
          this.dialogRef.close(true);
        },
        error: (err: any) => {
          console.error('Error:', err);
        },
      });
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
