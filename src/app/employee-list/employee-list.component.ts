import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { DeleteEmployeeComponent } from './delete-employee/delete-employee.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { CONSTANT } from '../../constant';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmployeeListComponent implements OnInit {
  jobTitles = CONSTANT.JOB_TITLES;
  employees: any;
  filteredEmployees: any;
  filterEmployeForm: FormGroup;
  placeholderDate = 'dd-mm-yyyy';

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {
    this.filterEmployeForm = this.fb.group({
      name: [''],
      jobTitle: [''],
      age: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filteredEmployees = employees;
      },
      error: (err) => {
        console.error('Error', err);
      },
    });
  }

  filterEmployees() {
    const filters = this.filterEmployeForm.value;
    this.employeeService.searchEmployees(filters).subscribe((employees) => {
      this.filteredEmployees = employees;
    });
  }

  clearFilters(): void {
    this.filterEmployeForm.reset();
    this.loadEmployees();
  }

  openAddDialog(action: any, employee?: any) {
    const dialogRef = this.dialog.open(AddEmployeeComponent, {
      width: '30%',
      data: { action, formValue: employee },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  deleteEmployee(employee: any): void {
    if (this.employees.length === 1) {
      this.snackBar.open('This is the last record use can not delete', 'Close');
      return;
    }
    const dialogRef = this.dialog.open(DeleteEmployeeComponent, {
      width: '25%',
      data: {
        id: employee.id,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEmployees();
      }
    });
  }
}
