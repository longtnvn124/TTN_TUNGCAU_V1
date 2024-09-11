import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatMenuModule} from '@angular/material/menu';
import {NgxDocViewerModule} from 'ngx-doc-viewer';

import {OvicFlexibleTableComponent} from '@shared/components/ovic-flexible-table/ovic-flexible-table.component';
import {OvicDropdownComponent} from '@shared/components/ovic-dropdown/ovic-dropdown.component';
import {OvicAudioPlayerComponent} from '@shared/components/ovic-audio-player/ovic-audio-player.component';
import {OvicIconPickerComponent} from '@shared/components/ovic-icon-picker/ovic-icon-picker.component';
import {OvicTableComponent} from '@shared/components/ovic-table/ovic-table.component';
import {OvicDatePickerComponent} from '@shared/components/ovic-date-picker/ovic-date-picker.component';
import {OvicPreviewComponent} from '@shared/components/ovic-preview/ovic-preview.component';
import {OvicMultiSelectComponent} from '@shared/components/ovic-multi-select/ovic-multi-select.component';
import {OvicProgressComponent} from '@shared/components/ovic-progress/ovic-progress.component';
import {OvicDataPickerComponent} from '@shared/components/ovic-data-picker/ovic-data-picker.component';
import {OvicCurrencyInputComponent} from '@shared/components/ovic-currency-input/ovic-currency-input.component';
import {OvicFileManagerComponent} from '@shared/components/ovic-file-manager/ovic-file-manager.component';
import {OvicGroupsRadioComponent} from '@shared/components/ovic-groups-radio/ovic-groups-radio.component';
import {OvicRatingComponent} from '@shared/components/ovic-rating/ovic-rating.component';
import {
  OvicPercentagesTableComponent
} from '@shared/components/ovic-percentages-table/ovic-percentages-table.component';
import {OvicQuestionsComponent} from '@shared/components/ovic-questions/ovic-questions.component';
import {OvicNavigationComponent} from '@shared/components/ovic-navigation/ovic-navigation.component';
import {OvicVideoPlayerComponent} from '@shared/components/ovic-video-player/ovic-video-player.component';
import {OvicInputBoxComponent} from '@shared/components/ovic-input-box/ovic-input-box.component';
import {OvicFileListComponent} from '@shared/components/ovic-file-list/ovic-file-list.component';
import {OvicFileDetailComponent} from '@shared/components/ovic-file-detail/ovic-file-detail.component';
import {OvicFileExplorerComponent} from '@shared/components/ovic-file-explorer/ovic-file-explorer.component';
import {OvicRecorderComponent} from '@shared/components/ovic-recorder/ovic-recorder.component';
import {OvicTextareaComponent} from '@shared/components/ovic-textarea/ovic-textarea.component';
import {OvicEditorComponent} from '@shared/components/ovic-editor/ovic-editor.component';
import {OvicDocumentListComponent} from '@shared/components/ovic-document-list/ovic-document-list.component';
import {OvicDocumentViewerComponent} from '@shared/components/ovic-document-viewer/ovic-document-viewer.component';
import {
  OvicDownloadProgressComponent
} from '@shared/components/ovic-download-progress/ovic-download-progress.component';

import {
  OvicPersonalFileExplorerComponent
} from '@shared/components/ovic-personal-file-explorer/ovic-personal-file-explorer.component';
import {
  OvicPreviewSingleGoogleDriveFileComponent
} from '@shared/components/ovic-preview-single-google-drive-file/ovic-preview-single-google-drive-file.component';
import {
  OvicDocumentDownloaderComponent
} from '@shared/components/ovic-document-downloader/ovic-document-downloader.component';
import {
  OvicPreviewFileFullsizeComponent
} from '@shared/components/ovic-preview-file-fullsize/ovic-preview-file-fullsize.component';
import {OvicMediaPlayerComponent} from '@shared/components/ovic-media-player/ovic-media-player.component';
import {
  OvicRightContentMenuComponent
} from '@shared/components/ovic-right-content-menu/ovic-right-content-menu.component';
import {OvicAvatarMakerComponent} from '@shared/components/ovic-avatar-maker/ovic-avatar-maker.component';

import {OvicFileNamePipe} from '@shared/pipes/ovic-file-name.pipe';
import {OvicFileExtensionPipe} from '@shared/pipes/ovic-file-extension.pipe';
import {OvicTimerMmSsPipe} from '@shared/pipes/ovic-timer-mm-ss.pipe';
import {OvicDateTimePipe} from '@shared/pipes/ovic-date-time.pipe';
import {OvicTimePipe} from '@shared/pipes/ovic-time.pipe';
import {OvicFileIconPipe} from '@shared/pipes/ovic-file-icon.pipe';
import {OvicDatePipe} from '@shared/pipes/ovic-date.pipe';
import {FileTypePipe} from '@shared/pipes/file-type.pipe';
import {OvicFileSizePipe} from '@shared/pipes/ovic-file-size.pipe';
import {OvicSafeUrlPipe} from '@shared/pipes/ovic-safe-url.pipe';
import {OvicFileShareStatePipe} from '@shared/pipes/ovic-file-share-state.pipe';
import {OvicSafeResourceUrlPipe} from '@shared/pipes/ovic-safe-resource-url.pipe';
import {OvicSafeHtmlPipe} from '@shared/pipes/ovic-safe-html.pipe';
import {SafeHtmlPipe} from '@shared/pipes/safe-html.pipe';
import {OvicYoutubeThumbnailDirective} from '@shared/directives/ovic-youtube-thumbnail.directive';
import {OvicVideoAspectRatio16x9Directive} from '@shared/directives/ovic-video-aspect-ratio16x9.directive';
import {OvicLoaderDirective} from '@shared/directives/ovic-loader.directive';
import {OvicEditorDirective} from '@shared/directives/ovic-editor.directive';
import {OvicDropAndDragDirective} from '@shared/directives/ovic-drop-and-drag.directive';
import {OvicMediaLoaderDirective} from '@shared/directives/ovic-media-loader.directive';
import {InputNumberModule} from 'primeng/inputnumber';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {CalendarModule} from 'primeng/calendar';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PlyrModule} from 'ngx-plyr';
import {MultiSelectModule} from 'primeng/multiselect';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {NgxViewerModule} from 'ngx-viewer';
import {ImageCropperModule} from 'ngx-image-cropper';
import {RippleModule} from 'primeng/ripple';
import {TooltipModule} from 'primeng/tooltip';
import {BindCssVariablesDirective} from './directives/bind-css-variables.directive';
import {OvicLoggerDirective} from './directives/ovic-logger.directive';
import {SideFiltersComponent} from './components/side-filters/side-filters.component';
import {OvicDateInputComponent} from './components/ovic-date-input/ovic-date-input.component';
import {InputMaskModule} from 'primeng/inputmask';
import {OvicFlexibleTableNewComponent} from './components/ovic-flexible-table-new/ovic-flexible-table-new.component';
import {PaginatorModule} from 'primeng/paginator';
import {
  OvicInputAddressFourLayoutsComponent
} from './components/ovic-input-address-four-layouts/ovic-input-address-four-layouts.component';
import {OvicPivotTableComponent} from './components/ovic-pivot-table/ovic-pivot-table.component';
import {OvicDateToUtcPipe} from './pipes/ovic-date-to-utc.pipe';
import {OvicLazyLoadDirective} from './directives/ovic-lazy-load.directive';
import {FileListLocalComponent} from './components/file-list-local/file-list-local.component';
import {FileListLocalOnTableComponent} from './components/file-list-local-on-table/file-list-local-on-table.component';
import {GetUserinfoDirective} from './directives/get-userinfo.directive';
import {GetAvatarByUserIdDirective} from './directives/get-avatar-by-user-id.directive';
import {GetAvatarDirective} from './directives/get-avatar.directive';
import {ImageLoadingDirective} from './directives/image-loading.directive';
import {UserInfoComponent} from './components/user-info/user-info.component';
import {ButtonModule} from 'primeng/button';
import {OvicLoadImageByIdDirective} from './directives/ovic-load-image-by-id.directive';
import {EditorModule} from 'primeng/editor';
import {OvicHtmlDecodePipe} from './pipes/ovic-html-decode.pipe';
import {ContextMenuModule} from "primeng/contextmenu";
import {DialogModule} from "primeng/dialog";
import {OvicPickerNgulieuComponent} from './components/ovic-picker-ngulieu/ovic-picker-ngulieu.component';
import {OrganizationPickerComponent} from "@shared/components/organization-picker/organization-picker.component";
import {OvicFileCorpusComponent} from './components/ovic-file-corpus/ovic-file-corpus.component';
import {OvicMapComponent} from './components/ovic-map/ovic-map.component';
import {NgxMapboxGLModule} from "ngx-mapbox-gl";
import {OvicMediaVrComponent} from '@shared/components/ovic-media-vr/ovic-media-vr.component';
import { TreeCustomComponent } from '@shared/components/tree-custom/tree-custom.component';
import {AutoFocusDirective} from "@shared/directives/auto-focus.directive";
import { OvicMediaVrProductComponent } from './components/ovic-media-vr-product/ovic-media-vr-product.component';
import { OvicResizeDropdowDirective } from './directives/ovic-resize-dropdow.directive';
import { OvicTestCheckboxComponent } from './components/ovic-test-checkbox/ovic-test-checkbox.component';
import {RadioButtonModule} from "primeng/radiobutton";
import {CheckboxModule} from "primeng/checkbox";
import {
    AnswerOptionGroupComponent
} from "@shared/components/ovic-test-checkbox/answer-option-group/answer-option-group.component";

import {InputTextareaModule} from "primeng/inputtextarea";
@NgModule({
  declarations: [
    OvicFlexibleTableComponent,
    OvicDropdownComponent,
    OvicAudioPlayerComponent,
    SafeHtmlPipe,
    OvicIconPickerComponent,
    OvicTableComponent,
    OvicDatePickerComponent,
    OvicPreviewComponent,
    OvicMultiSelectComponent,
    OvicProgressComponent,
    OvicDataPickerComponent,
    OvicCurrencyInputComponent,
    OvicFileManagerComponent,
    OvicGroupsRadioComponent,
    OvicRatingComponent,
    OvicPercentagesTableComponent,
    OvicQuestionsComponent,
    OvicNavigationComponent,
    OvicVideoPlayerComponent,
    OvicInputBoxComponent,
    OvicFileListComponent,
    OvicFileDetailComponent,
    OvicFileExplorerComponent,
    OvicRecorderComponent,
    OvicTextareaComponent,
    OvicEditorComponent,
    OvicDocumentListComponent,
    OvicDocumentViewerComponent,
    OvicDownloadProgressComponent,
    OvicPersonalFileExplorerComponent,
    OvicPreviewSingleGoogleDriveFileComponent,
    OvicDocumentDownloaderComponent,
    OvicPreviewFileFullsizeComponent,
    OvicMediaPlayerComponent,
    OvicRightContentMenuComponent,
    OvicAvatarMakerComponent,
    OvicFileNamePipe,
    OvicFileExtensionPipe,
    OvicTimerMmSsPipe,
    OvicDateTimePipe,
    OvicTimePipe,
    OvicFileIconPipe,
    OvicDatePipe,
    FileTypePipe,
    OvicFileSizePipe,
    OvicSafeUrlPipe,
    OvicFileShareStatePipe,
    OvicSafeResourceUrlPipe,
    OvicSafeHtmlPipe,
    OvicYoutubeThumbnailDirective,
    OvicVideoAspectRatio16x9Directive,
    OvicLoaderDirective,
    OvicEditorDirective,
    OvicDropAndDragDirective,
    OvicMediaLoaderDirective,
    BindCssVariablesDirective,
    OvicLoggerDirective,
    SideFiltersComponent,
    OvicDateInputComponent,
    OvicFlexibleTableNewComponent,
    OvicInputAddressFourLayoutsComponent,
    OvicPivotTableComponent,
    OvicDateToUtcPipe,
    OvicLazyLoadDirective,
    FileListLocalComponent,
    FileListLocalOnTableComponent,
    GetUserinfoDirective,
    GetAvatarByUserIdDirective,
    GetAvatarDirective,
    ImageLoadingDirective,
    UserInfoComponent,
    OvicLoadImageByIdDirective,
    OvicHtmlDecodePipe,
    OvicPickerNgulieuComponent,
    OrganizationPickerComponent,
    OvicFileCorpusComponent,
    OvicMapComponent,
    OvicMediaVrComponent,
    TreeCustomComponent,
    AutoFocusDirective,
    OvicMediaVrProductComponent,
    OvicResizeDropdowDirective,
    OvicTestCheckboxComponent,


  ],
  imports: [
    EditorModule,
    CommonModule,
    RouterModule,
    FormsModule,
    DropdownModule,
    InputNumberModule,
    TableModule,
    InputTextModule,
    MatProgressBarModule,
    MatMenuModule,
    CalendarModule,
    NgxDocViewerModule,
    ReactiveFormsModule,
    DragDropModule,
    PlyrModule,
    MultiSelectModule,
    PdfViewerModule,
    NgxViewerModule,
    ImageCropperModule,
    RippleModule,
    TooltipModule,
    InputMaskModule,
    PaginatorModule,
    ButtonModule,
    ContextMenuModule,
    DialogModule,
    NgxMapboxGLModule,
    RadioButtonModule,
    CheckboxModule,
    AnswerOptionGroupComponent,
    InputTextareaModule,
    // Quill.forRoot({
    //   modules:{
    //     imageResize: {
    //       displaySize: true,
    //     },
    //   },theme:'snow'
    // })
  ],
  // entryComponents : [
  // 	OvicTableComponent ,
  // 	OvicPreviewComponent ,
  // 	OvicAvatarMakerComponent ,
  // 	OvicTableComponent ,
  // 	OvicPreviewComponent ,
  // 	OvicDownloadProgressComponent ,
  // 	OvicPersonalFileExplorerComponent ,
  // 	EmployeesPickerComponent
  // ] ,
  exports: [
    OvicDropdownComponent,
    OvicFlexibleTableComponent,
    OvicAudioPlayerComponent,
    SafeHtmlPipe,
    OvicIconPickerComponent,
    OvicTableComponent,
    OvicDatePickerComponent,
    OvicPreviewComponent,
    OvicMultiSelectComponent,
    OvicProgressComponent,
    OvicDataPickerComponent,
    OvicCurrencyInputComponent,
    OvicFileManagerComponent,
    OvicGroupsRadioComponent,
    OvicRatingComponent,
    OvicPercentagesTableComponent,
    OvicQuestionsComponent,
    OvicNavigationComponent,
    OvicVideoPlayerComponent,
    OvicInputBoxComponent,
    OvicFileListComponent,
    OvicFileDetailComponent,
    OvicFileExplorerComponent,
    OvicRecorderComponent,
    OvicTextareaComponent,
    OvicEditorComponent,
    OvicDocumentListComponent,
    OvicDocumentViewerComponent,
    OvicDownloadProgressComponent,
    OvicPersonalFileExplorerComponent,
    OvicPreviewSingleGoogleDriveFileComponent,
    OvicDocumentDownloaderComponent,
    OvicPreviewFileFullsizeComponent,
    OvicMediaPlayerComponent,
    OvicRightContentMenuComponent,
    OvicDateInputComponent,
    FileListLocalComponent,
    FileListLocalOnTableComponent,
    OvicFlexibleTableNewComponent,
    OvicInputAddressFourLayoutsComponent,
    OvicFileNamePipe,
    OvicFileExtensionPipe,
    OvicTimerMmSsPipe,
    OvicDateTimePipe,
    OvicTimePipe,
    OvicFileIconPipe,
    OvicDatePipe,
    FileTypePipe,
    OvicFileSizePipe,
    OvicSafeUrlPipe,
    OvicFileShareStatePipe,
    OvicSafeResourceUrlPipe,
    OvicSafeHtmlPipe,
    OvicDateToUtcPipe,
    OvicHtmlDecodePipe,
    OvicYoutubeThumbnailDirective,
    OvicVideoAspectRatio16x9Directive,
    OvicLoaderDirective,
    OvicEditorDirective,
    OvicDropAndDragDirective,
    OvicMediaLoaderDirective,
    OvicLoggerDirective,
    OvicLazyLoadDirective,
    GetUserinfoDirective,
    UserInfoComponent,
    OvicLoadImageByIdDirective,
    OvicFileCorpusComponent,
    OvicMapComponent,
    OvicMediaVrComponent,
    TreeCustomComponent,
    AutoFocusDirective,
    OvicMediaVrProductComponent,
    OvicResizeDropdowDirective,
    OvicTestCheckboxComponent,

  ]
})
export class SharedModule {
}
