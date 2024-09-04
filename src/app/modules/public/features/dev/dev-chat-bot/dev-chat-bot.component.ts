import { Component, OnInit } from '@angular/core';

export interface ChatBot {
  id:number;
  question:string;
  answers?:string;
}


@Component({
  selector: 'dev-chat-bot',
  templateUrl: './dev-chat-bot.component.html',
  styleUrls: ['./dev-chat-bot.component.css']
})
export class DevChatBotComponent implements OnInit {

  datachat:ChatBot[]=[
    {
      id:1,
      question:'Cách đăng nhâp hệ thống',
    },
    {
      id:2,
      question:'Xem chi tiết bài thi',
    }
    ,{
      id:3,
      question:'Cách xem',
    },{
      id:4,
      question:'Cách đăng nhâp hệ thống',
    }
    ,{
      id:5,
      question:'Cách đăng nhâp hệ thống',
    }
  ];
  constructor(

  ) { }


  ngOnInit(): void {
  }


  sendChat(){
    console.log(1111)
  }
}
