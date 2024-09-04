import { Component, OnInit } from '@angular/core';
import {DotThiKetQuaService} from "@shared/services/dot-thi-ket-qua.service";
import {ThiSinhService} from "@shared/services/thi-sinh.service";

@Component({
  selector: 'app-home-dhtn',
  templateUrl: './home-dhtn.component.html',
  styleUrls: ['./home-dhtn.component.css']
})
export class HomeDhtnComponent implements OnInit {
  count:number;
  constructor(
    private shiftTestService: DotThiKetQuaService,
    private thiSinhService: ThiSinhService
  ) { }

  ngOnInit(): void {
    this.thiSinhService.getCountData().subscribe({
      next:(ew)=>{
        this.count = ew;
        localStorage.setItem('count',ew.toString());
      },
      error:(e)=>{
        console.log(e);
      }
    })
  }

}
