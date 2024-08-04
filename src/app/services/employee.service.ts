import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  private storageKey = "employees";

  constructor() {
    this.initializeDatabase();
  }

  getEmployees(): Observable<any[]> {
    const employees = this.getFromLocalStorage();
    return of(employees);
  }

  addEmployee(employee: any): Observable<void> {
    const employees = this.getFromLocalStorage();
    employees.push(employee);
    this.saveToLocalStorage(employees);
    return of();
  }

  updateEmployee(employee: any): Observable<void> {
    const employees = this.getFromLocalStorage();
    const index = employees.findIndex((emp) => emp.id === employee.id);
    if (index !== -1) {
      employees[index] = employee;
      this.saveToLocalStorage(employees);
    }
    return of();
  }

  deleteEmployee(id: number): Observable<void> {
    const employees = this.getFromLocalStorage();
    const updatedEmployees = employees.filter((emp) => emp.id !== id);
    this.saveToLocalStorage(updatedEmployees);
    return of();
  }

  searchEmployees(filters: any): Observable<any[]> {
    const employees = this.getFromLocalStorage();
    const filteredEmployees = employees.filter((employee) => {
      const employeeEndDate =
        employee.endDate && employee.endDate !== "Currently Working"
          ? new Date(employee.endDate)
          : null;
      const filterEndDate = filters.endDate ? new Date(filters.endDate) : null;
      return (
        (!filters.name ||
          employee.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.jobTitle ||
          employee.jobTitle
            .toLowerCase()
            .includes(filters.jobTitle.toLowerCase())) &&
        (!filters.age || employee.age.toString() === filters.age) &&
        (!filters.startDate ||
          new Date(employee.startDate) >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          !employeeEndDate ||
          !filterEndDate ||
          employeeEndDate >= filterEndDate)
      );
    });
    return of(filteredEmployees);
  }

  private initializeDatabase() {
    this.getEmployees().subscribe((employees) => {
      if (employees.length === 0) {
        this.addDefaultEmployees().subscribe();
      }
    });
  }

  private addDefaultEmployees(): Observable<void> {
    const defaultEmployees = [
      {
        id: 1, // Add unique id for localStorage
        name: "Akhil Gupta",
        jobTitle: "Software Engineer",
        age: 30,
        startDate: new Date("2022-01-01"),
        endDate: new Date("2023-01-01"),
      },
      {
        id: 2,
        name: "Abhishek Soni",
        jobTitle: "Team Lead",
        age: 40,
        startDate: new Date("2021-06-15"),
        endDate: new Date("2022-06-15"),
      },
      {
        id: 3,
        name: "Priyansh Gupta",
        jobTitle: "Manager",
        age: 22,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
      },
      {
        id: 4,
        name: "Ankit",
        jobTitle: "Quality Analysis",
        age: 26,
        startDate: new Date("2020-06-15"),
        endDate: new Date("2024-06-15"),
      },
      {
        id: 5,
        name: "Manish",
        jobTitle: "UI Designer",
        age: 37,
        startDate: new Date("2021-06-15"),
        endDate: "Currently Working",
      },
    ];

    return new Observable<void>((observer) => {
      defaultEmployees.forEach((employee) => {
        this.addEmployee(employee).subscribe();
      });
      observer.next();
      observer.complete();
    });
  }

  private getFromLocalStorage(): any[] {
    const employees = localStorage.getItem(this.storageKey);
    return employees ? JSON.parse(employees) : [];
  }

  private saveToLocalStorage(employees: any[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(employees));
  }
}
