import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { EmployeeService } from "src/app/services/employee.service";

@Component({
  selector: "app-delete-employee",
  templateUrl: "./delete-employee.component.html",
  styleUrls: ["./delete-employee.component.scss"],
})
export class DeleteEmployeeComponent {
  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DeleteEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  deleteEmp() {
    this.employeeService.deleteEmployee(this.data.id).subscribe({
      next: () => {
        this.snackBar.open("Employee Deleted successfully!", "Close");
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error("Error deleting employee:", err);
      },
    });
  }

  closedPopUp() {
    this.dialogRef.close(false);
  }
}
