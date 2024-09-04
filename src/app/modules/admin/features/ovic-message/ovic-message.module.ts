import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OvicMessageRoutingModule } from './ovic-message-routing.module';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TranslateModule } from '@ngx-translate/core';
import { RippleModule } from 'primeng/ripple';

import { ChatComponent } from './components/chat/chat.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { StickyNotificationsComponent } from './components/sticky-notifications/sticky-notifications.component';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from '@shared/shared.module';
import { SingleNotificationComponent } from './components/single-notification/single-notification.component';
import { NewNotificationComponent } from './components/new-notification/new-notification.component';
import { PaginatorModule } from 'primeng/paginator';
import { MenuModule } from 'primeng/menu';
import { RemoveHtmlTagsPipe } from './pipes/remove-html-tags.pipe';

@NgModule( {
	declarations : [
		ChatComponent ,
		NotificationsComponent ,
		StickyNotificationsComponent ,
		SingleNotificationComponent ,
		NewNotificationComponent ,
		RemoveHtmlTagsPipe
	] ,
	exports      : [
		StickyNotificationsComponent
	] ,
	imports      : [
		CommonModule ,
		OvicMessageRoutingModule ,
		OverlayPanelModule ,
		TranslateModule ,
		RippleModule ,
		ButtonModule ,
		SharedModule ,
		PaginatorModule ,
		MenuModule
	]
} )
export class OvicMessageModule {}
