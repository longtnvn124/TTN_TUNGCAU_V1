import {Inject, Injectable} from '@angular/core';
import {ACCESS_TOKEN, environment, getFileDir, getLinkDownload, getLinkDrive, getLinkMedia, getRoute} from '@env';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  HttpProgressEvent,
  HttpResponse
} from '@angular/common/http';
import {
  OvicFileUpload,
  FileDto,
  OvicFileStore,
  OvicDriveFile,
  OvicFile,
  Download,
  Upload,
  OvicDriveFolder
} from '@core/models/file';
import {Observable, of} from 'rxjs';
import {catchError, distinctUntilChanged, filter, map, retry, scan} from 'rxjs/operators';
import {Dto} from '@core/models/dto';
import {saveAs} from 'file-saver';
import {SAVER, Saver} from '@core/providers/saver.provider';
import {AuthService} from "@core/services/auth.service";
import { NotificationService } from './notification.service';
import {HttpParamsHeplerService} from "@core/services/http-params-hepler.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private readonly media = getLinkMedia('');
  private readonly dir = getFileDir();
  private readonly download = getLinkDownload(null);
  private readonly googleDrive = getLinkDrive('');

  constructor(
    private http: HttpClient,
    @Inject(SAVER) private save: Saver,
    private noitifi: NotificationService,
    private modalService: NgbModal,
    private httpHelper: HttpParamsHeplerService,
    private auth: AuthService,
  ) {
  }

  /**********************************************************
   * Convert, prebuild and packet functions
   * ********************************************************/
  private static packFiles(files: File[], status: number = 0): FormData {
    const formData = new FormData();
    if (files && files.length) {
      for (const file of files) {
        formData.append('upload', file);
      }
    }
    formData.append('public', status.toString(10));
    return formData;
  }

  /**************************************************************
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   *************************************************************/
  formatBytes(bytes, decimals = 2): string {
    if (!bytes || bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  base64ToFile(base64: string, fileName: string): File {
    const bytes = base64.split(',')[0].indexOf('base64') >= 0 ? atob(base64.split(',')[1]) : (<any>window).unescape(base64.split(',')[1]);
    const mime = base64.split(',')[0].split(':')[1].split(';')[0];
    const max = bytes.length;
    const ia = new Uint8Array(max);
    for (let i = 0; i < max; i++) {
      ia[i] = bytes.charCodeAt(i);
    }
    return new File([ia], fileName, {lastModified: new Date().getTime(), type: mime});
  }

  blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, {lastModified: new Date().getTime(), type: blob.type});
  }

  blobToBase64(blob: Blob | File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = () => resolve(null);
      reader.onload = () => resolve(reader.result.toString());
      reader.readAsDataURL(blob);
    });
  }

  ovicFileInfoToOvicFileUpload(files: OvicFile[]): OvicFileUpload[] {
    let results: OvicFileUpload[] = [];
    if (files.length && Array.isArray(files)) {
      results = files.map(f => ({id: f.id, name: f.name, title: f.title, ext: f.ext, size: f.size}));
    }
    return results;
  }

  getUploadDate(file: OvicFile | OvicDriveFile): string {
    let result = '__/__/____ --:--';
    const fileDate = file['created_at'] || file['createdTime'];
    if (fileDate) {
      const postIn = new Date(fileDate),
        date = postIn.getDate() < 10 ? '0'.concat(postIn.getDate().toString()) : postIn.getDate().toString(),
        month = postIn.getMonth() < 10 ? '0'.concat((postIn.getMonth() + 1).toString()) : (postIn.getMonth() + 1).toString(),
        year = postIn.getFullYear().toString(),
        hour = postIn.getHours() < 10 ? '0'.concat(postIn.getHours().toString()) : postIn.getHours().toString(),
        min = postIn.getMinutes() < 10 ? '0'.concat(postIn.getMinutes().toString()) : postIn.getMinutes().toString();
      result = ''.concat(date, '/', month, '/', year, ' ', hour, ':', min);
    }
    return result;
  }

  deleteFiles(ids: number[]): Observable<any> {
    return this.http.delete<Dto>(''.concat(this.media, ids.join(',')));
  }

  deleteFile(id: number): Observable<any> {
    return this.http.delete<Dto>(''.concat(this.media, id.toString()));
  }

  getFileInfo(ids: string): Observable<OvicFile[]> {
    return this.http.get<Dto>(''.concat(this.media, ids)).pipe(map(res => res.data));
  }

  /**********************************************************
   * Upload file functions
   * ********************************************************/
  uploadFile(file: File, _public: number = 0): Observable<OvicFile> {
    return this.http.post<Dto>(this.media, FileService.packFiles([file], _public)).pipe(
      retry(2),
      map(res => Array.isArray(res.data) ? res.data[0] : res.data)
    );
  }

  /**********************************************************
   * uploadAvatar
   * Upload avatar for user
   * @var file : File image
   * ********************************************************/
  uploadAvatar(file: File): Observable<string> {
    return this.http.post<Dto>(getRoute('avatar'), FileService.packFiles([file])).pipe(
      retry(2),
      map(res => Array.isArray(res.data) ? res.data[0] : res.data)
    );
  }

  uploadMultipleFiles(files: File[], donvi_id: number = 0, user_id: number = 0): Observable<OvicFile[]> {
    const params = new HttpParams().set('donvi_id', donvi_id.toString()).set('user_id', user_id.toString());
    return this.http.post<Dto>(this.media, FileService.packFiles(files), {params: params}).pipe(
      retry(2),
      map(res => res.data)
    );
  }

  uploadFileWidthProgress( file : File , state : number = 0 ) : Observable<Upload> {
    const initialState : Upload = { info : null , state : 'PENDING' , progress : 0 };
    const calculateState        = ( upload : Upload , event : HttpEvent<unknown> , index : number ) : Upload => {
      if ( event.type == HttpEventType.UploadProgress ) {
        return {
          info     : null ,
          state    : 'IN_PROGRESS' ,
          progress : Math.round( ( 100 / event.total ) * event.loaded )
        };
      } else if ( event.type == HttpEventType.Response ) {
        return {
          info     : event.body[ 'data' ][ 0 ] ,
          state    : 'DONE' ,
          progress : 100
        };
      } else {
        return upload;
      }
    };
    return this.http.post<HttpEvent<Dto>>( this.media , FileService.packFiles( [file] , state ) , { reportProgress : true , observe : 'events' } ).pipe(
      scan( calculateState , initialState ) ,
      distinctUntilChanged( ( a , b ) => a.state === b.state && a.progress === b.progress && a.info === b.info ) ,
      catchError( () => ( of( { info : null , progress : 0 , state : 'FAILED' } as Upload ) ) )
    );
  }

  updateFileInfo(id: number, info: { title?: string; donvi_id?: number; user_id?: number; shared?: string }): Observable<number> {
    return this.http.put<Dto>(''.concat(this.media, id.toString()), info).pipe(map(res => res.data));
  }

  /**********************************************************
   * Download file functions
   * ********************************************************/
  downloadFileByName(fileName: string, title: string): Promise<boolean> {
    return new Promise(resolve => {
      this.getFileAsBlobByName(fileName).subscribe(
        {
          next: stream => {
            saveAs(stream, title);
            resolve(true);
          },
          error: () => resolve(false)
        }
      );
    });
  }

  downloadFileFromLocalAssets(src: string, title: string): Promise<boolean> {
    return new Promise(resolve => {
      this.http.get(src, {responseType: 'blob'}).subscribe({
          next: stream => {
            saveAs(stream, title);
            resolve(true);
          },
          error: () => resolve(false)
        }
      );
    });
  }

  /**********************************************************
   * Load folder and year
   * ********************************************************/
  loadDir(): Observable<any> {
    return this.http.get(this.dir);
  }

  getFileList(params: any): Observable<OvicFile[]> {
    const _params = ['orderby=created_at', 'order=desc'];
    Object.keys(params).forEach(function (key) {
      if (params[key]) {
        _params.push(`${key}=${params[key]}`);
      }
    });

    return this.http.get<Dto>(this.media, {params: new HttpParams({fromString: _params.join('&')})}).pipe(map(res => res.data));
  }

  getLibrary(limit: number, pageNumber: number, search: string): Observable<FileDto> {
    const _offset = (pageNumber * limit) - limit;
    let _params = new HttpParams().set('orderby', 'created_at').set('limit', limit.toString()).set('order', 'desc').set('offset', _offset.toString()).set('draw', pageNumber.toString());
    if (search.length) {
      _params = new HttpParams().set('orderby', 'created_at').set('limit', limit.toString()).set('title', search).set('order', 'desc').set('offset', _offset.toString()).set('draw', pageNumber.toString());
    }
    return this.http.get<Dto>(this.media, {params: _params});
  }

  getFileSize(file: OvicFile | OvicFileStore | OvicDriveFile): string {
    const fileSize = file.size ? (typeof file.size === 'string' ? parseInt(file.size, 10) : file.size) : 0;
    return this.formatBytes(fileSize);
  }

  getFileAsBlobByName(fileName: string): Observable<Blob> {
    return this.http.get(''.concat(this.download, fileName), {responseType: 'blob'});
  }


  getExternalFileAsBlob(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, {responseType: 'blob'});
  }

  getFileAsObjectUrl(nameOrId: string): Observable<string> {
    return this.http.get(''.concat(this.download, nameOrId), {responseType: 'blob'}).pipe(map(res => URL.createObjectURL(res)));
  }

  getFileFromLocalAssets(url: string): Observable<string> {
    return this.http.get(url, {responseType: 'blob'}).pipe(map(blob => URL.createObjectURL(blob)));
  }

  /************************************************************
   * Google drive
   * **********************************************************/
  getFileGoogleDrive(): Observable<OvicDriveFile[]> {
    return this.http.get<Dto>(this.googleDrive).pipe(map(res => res.data || []));
  }

  gdLoadFolder(parentId: string): Observable<OvicDriveFile[]> {
    const params = new HttpParams().set('parents', parentId);
    return this.http.get<Dto>(this.googleDrive, {params}).pipe(map(res => res.data || []));
  }

  gdSearch(input: { s?: string, parents?: string } | any): Observable<{ data: OvicDriveFile[], next?: string }> {
    const params = new HttpParams({fromObject: input});
    return this.http.get<Dto>(this.googleDrive, {params});
  }

  gdLoadMore(next: string, limit?: number): Observable<{ data: OvicDriveFile[], next?: string }> {
    if (!next) {
      return of({data: []});
    }
    const fromObject = {next};
    const params = new HttpParams({fromObject});
    return this.http.get<Dto>(this.googleDrive, {params});
  }

  gdGetFile(id: string): Observable<OvicDriveFile> {
    return this.http.get<Dto>(''.concat(this.googleDrive, id)).pipe(map(res => res.data || []));
  }

  gdDownloadWithProgress(id: string, filename?: string): Observable<Download> {
    const urlFile = this.googleDrive + id.toString() + '/download';
    return this.downloadExternalWithProgress(urlFile, filename);
  }

  gdStreamMedia(id: string): Observable<HttpEvent<Blob>> {
    const urlFile = this.googleDrive + id.toString() + '/download';
    return this.http.get(urlFile, {reportProgress: true, observe: 'events', responseType: 'blob'});
  }

  gdDeleteFile(id: string): Observable<any> {
    return this.http.delete<Dto>(''.concat(this.googleDrive, id)).pipe(map(res => res.data || []));
  }

  // gdUploadFile( file ) : Observable<any> {
  // 	return this.http.post<Dto>( this.googleDrive , FileService.packFiles( [ file ] ) ).pipe( map( res => res.data || [] ) );
  // }

  googleDriveUploadFileToParents(file: File, parents: string): Observable<OvicDriveFile[]> {
    const headers = new HttpHeaders().set('parents', parents);
    return this.http.post<Dto>(this.googleDrive, FileService.packFiles([file]), {headers}).pipe(map(res => res.data || ''));
  }

  gdGetFileAsObjectUrl(id: string): Observable<string> {
    const urlFile = this.googleDrive + id.toString() + '/download';
    return this.http.get(urlFile, {responseType: 'blob'}).pipe(map(res => URL.createObjectURL(res)));
  }

  /**************************************************************
   * Download and progress
   * ************************************************************/
  isHttpResponse<T>(event: HttpEvent<T>): event is HttpResponse<T> {
    return event.type === HttpEventType.Response;
  }

  isHttpProgressEvent(event: HttpEvent<unknown>): event is HttpProgressEvent {
    return (event.type === HttpEventType.DownloadProgress || event.type === HttpEventType.UploadProgress);
  }

  downloadWithProgress(id: number, filename?: string): Observable<Download> {
    return this.downloadExternalWithProgress(''.concat(this.download, id.toString()), filename || null);
  }

  downloadExternalWithProgress(url: string, filename?: string): Observable<Download> {
    const saver = filename ? blob => this.save(blob, filename) : null;
    return this.http.get(url, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    }).pipe(this._downloadProcess(saver));
  }

  private _downloadProcess(saver?: (b: Blob) => void): (source: Observable<HttpEvent<Blob>>) => Observable<Download> {
    return (source: Observable<HttpEvent<Blob>>) => source.pipe(
      scan(
        (download: Download, event): Download => {
          if (this.isHttpProgressEvent(event)) {
            return {
              progress: event.total ? Math.round((100 * event.loaded) / event.total) : download.progress,
              state: 'IN_PROGRESS',
              content: null
            };
          }
          if (this.isHttpResponse(event)) {
            if (saver) {
              saver(event.body);
            }
            return {
              progress: 100,
              state: 'DONE',
              content: event.body
            };
          }
          return download;
        },
        {state: 'PENDING', progress: 0, content: null}
      ),
      distinctUntilChanged((a, b) => a.state === b.state && a.progress === b.progress && a.content === b.content)
    );
  }

  gdShare(fileId: string): Observable<any> {
    return this.http.post<Dto>(''.concat(this.googleDrive, 'shared/', fileId), {id: 'anyoneWithLink'}).pipe(map(res => res.data || []));
  }

  createPersonalFolder(info: { name: string, parents: string }): Observable<OvicDriveFolder> {
    return this.http.post<Dto>(''.concat(this.googleDrive, 'folder'), info).pipe(map(res => res.data));
  }

  getImageContentFromLocalAssesFile(file: string): Observable<string> {
    return this.http.get(file, {responseType: 'blob'}).pipe(map(res => URL.createObjectURL(res)));
  }

  getImageContent(name_or_id: string): Observable<string> {
    return this.http.get(''.concat(this.download, name_or_id), {responseType: 'blob'}).pipe(map(res => URL.createObjectURL(res)));
  }

  getImageContentByUrl(urlFile: string): Observable<string> {
    return this.http.get(urlFile, {responseType: 'blob'}).pipe(map(res => URL.createObjectURL(res)));
  }

  uploadFileOfDonviNew(files, donvi_id: number, user_id: number): Observable<any> {
    const params = new HttpParams().set('donvi_id', donvi_id.toString()).set('user_id', user_id.toString());
    return this.http.post<Dto>(this.media, FileService.packFiles(files), {params: params});
  }

  /********************************************************************************
   * Download file with progress
   * ******************************************************************************/
  downloadUnionFileProgress(file: OvicFile | OvicDriveFile): Observable<Download> {
    return file ? this.downloadUnionFileProgressById(file.id, file['title'] || file['name']) : of({
      content: null,
      progress: 0,
      state: 'PENDING'
    });
  }

  downloadUnionFileProgressById(fileId: number | string, fileName: string): Observable<Download> {
    let result: Observable<Download> = of({content: null, progress: 0, state: 'PENDING'});
    if (fileId) {
      result = typeof fileId === 'number' ? this.downloadWithProgress(fileId, fileName) : this.gdDownloadWithProgress(fileId, fileName);
    }
    return result;
  }

  /********************************************************************************
   * Download file without progress
   * ******************************************************************************/
  downloadUnionFile(file: OvicFile | OvicDriveFile): Observable<Download> {
    return this.downloadUnionFileById(file.id, file['title'] || file['name']);
  }

  downloadUnionFileById(fileId: number | string, fileName: string): Observable<Download> {
    return this.downloadUnionFileProgressById(fileId, fileName).pipe(filter(f => f.state === 'DONE'));
  }

  /********************************************************************************
   * Get file with progress
   * ******************************************************************************/
  getUnionFileProgress(file: OvicFile | OvicDriveFile): Observable<Download> {
    return this.getUnionFileProgressById(file ? file.id : null);
  }

  getUnionFileProgressById(fileId: number | string): Observable<Download> {
    let result: Observable<Download> = of({content: null, progress: 0, state: 'PENDING'});
    if (fileId) {
      const url = typeof fileId === 'number' ? ''.concat(this.download, fileId.toString()) : ''.concat(this.googleDrive, fileId, '/download');
      result = this.http.get(url, {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob'
      }).pipe(this._downloadProcess(null));
    }
    return result;
  }

  /********************************************************************************
   * Get file without progress
   * ******************************************************************************/
  getUnionFile(file: OvicFile | OvicDriveFile): Observable<string> {
    return this.getUnionFileById(file ? file.id : null);
  }

  getUnionFileById(fileId: number | string): Observable<string> {
    let result: Observable<string> = of(null);
    if (fileId) {
      const url = typeof fileId === 'number' ? ''.concat(this.download, fileId.toString()) : ''.concat(this.googleDrive, fileId, '/download');
      result = this.http.get(url, {responseType: 'blob'}).pipe(map(res => URL.createObjectURL(res)));
    }
    return result;
  }
 /*****************************************************************************/
  getPreviewLinkLocalFile( { id } : OvicFile | { id : number } ) : string {
    const url = new URL( getLinkDownload( id ) );
    url.searchParams.append( 'token' , localStorage.getItem( ACCESS_TOKEN ) || '' );
    return url.toString();
  }

  getPreviewLinkLocalFileNotToken( { id } : OvicFile | { id : number } ) : string {
    const url = new URL( getLinkDownload( id ) );
    return url.toString();
  }

}
