import {Component, OnInit} from '@angular/core';
import {ActionSheetController, AlertController, LoadingController, ModalController, NavController, ToastController} from '@ionic/angular';
import {CameraResultType, CameraSource, Plugins} from '@capacitor/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {PostService} from '../../services/post.service';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {File} from '@ionic-native/file/ngx';
import {FilePath} from '@ionic-native/file-path/ngx';
import {Base64} from '@ionic-native/base64/ngx';
const {CameraCapacitor} = Plugins;
declare var window;

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss'],
})
export class NewPostComponent implements OnInit {
  userData;
  postContent;
  contentPlaceholder = `What's on your mind?`;
  selectedImage = [];
  selectedVideo = [];
  // for debugging
  // selectedImage = ['http://lh3.googleusercontent.com/-exjT2HQeA1A/AAAAAAAAAAI/' +
  //     'AAAAAAAAAAA/ACHi3rc1GYtslTd6heuj-WwwBU4Rx1byoQ.CMID/s192-c/photo.jpg',
      // 'http://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
  // ];
  loading;
  base64;
  constructor(
      private modalController: ModalController,
      private alertController: AlertController,
      private toastController: ToastController,
      private loadingController: LoadingController,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
      private postService: PostService,
      private http: HttpClient,
      private alertCtrl: AlertController,
      private camera: Camera,
      private file: File,
      private filepath: FilePath,
  ) {
      this.base64 = new Base64();
  }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('n'));
  }
  async addPost() {
    if (!this.postContent) {
      this.alertController.create({header: 'Alert', message: `Post content can't be empty`, buttons: ['OK']})
          .then(alertEl => {
            alertEl.present();
          });
      return;
    }
    this.loading = await this.loadingController.create({
      message: 'Publishing...'
    });
    await this.loading.present();
    const formData = new FormData();
    for (const item of this.selectedImage) {
      const blob = await fetch(item).then(r => r.blob());
      formData.append('post_attachment[]', blob, `postAttachment.jpg`);
    }
    formData.append('id', this.userData.id);
    formData.append('content', this.postContent);
    console.log(formData);
    console.log('yes');
    this.http.post<any>(`https://sorrowflush.valuecreatives.com/api/posts/add`, formData, {
        headers: new HttpHeaders({
          'X-API-KEY': 'amandeep',
          Authorizations: this.userData.jwt
        })})
        .subscribe(res => {
        this.postService.addNewPost(res.data.post);
        this.loading.dismiss();
        this.toastController.create({
          message: 'Post Published Successfully',
          duration: 2000,
          buttons: [
            {
              text: 'Ok',
              role: 'cancel'
            }
          ]
        }).then(toastEl => {
          toastEl.present();
        });
        this.close();
    }, error1 => {
      this.loading.dismiss();
      this.alertController.create({header: 'Alert', message: `Something Went wrong! Please try again`, buttons: ['OK']})
          .then(alertEl => {
            alertEl.present();
          });
    });
  }
  removeImg(index) {
    this.selectedImage.splice(index, 1);
  }
  openMediaOptions() {
      this.actionSheetController.create({
          header: 'Choose Content Type',
          buttons: [
              {
                  text: 'Picture',
                  icon: 'image',
                  handler: () => {this.pickMediaNative(this.camera.MediaType.PICTURE); }
              },
              {
                  text: 'Video',
                  icon: 'videocam',
                  handler: () => {this.pickMediaNative(this.camera.MediaType.VIDEO); }
          }]
      }).then(el => el.present() );
  }
  pickMediaNative(mediaTypeSelected) {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI,
      mediaType: mediaTypeSelected,
      encodingType: this.camera.EncodingType.PNG,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    };
    this.camera.getPicture(options).then((imageData) => {
        console.log(JSON.stringify(imageData));
        if (mediaTypeSelected === this.camera.MediaType.VIDEO) {
            // imageData = 'file://' + imageData;
        }
        console.log(imageData);
        // this.base64.encodeFile(encodeURI(imageData)).then((base64File: string) => {
        //     console.log(base64File);
        //     if (mediaTypeSelected === this.camera.MediaType.PICTURE) {
        //         this.selectedImage.push(base64File);
        //     } else if (mediaTypeSelected === this.camera.MediaType.VIDEO) {
        //         this.selectedVideo.push(base64File);
        //     }
        // }, (err) => {
        //     console.log(err);
        // });

        this.file.readAsDataURL(imageData, 'tmp').then(base64File => {
                console.log(base64File);
                if (mediaTypeSelected === this.camera.MediaType.PICTURE) {
                    this.selectedImage.push(base64File);
                } else if (mediaTypeSelected === this.camera.MediaType.VIDEO) {
                    this.selectedVideo.push(base64File);
                }
        });

        // const base64Image = 'data:image/jpeg;base64,' + imageData;
        // if (mediaTypeSelected === this.camera.MediaType.PICTURE) {
        //     this.selectedImage.push(imageData);
        // }
        // window.webkitRequestFileSystem(window.PERSISTENT, 100500 * 1024 * 1024, () => {
        //         window.webkitResolveLocalFileSystemURL(imageData, (directoryEntry) => {
        //                 console.log('success', directoryEntry);
        //             },
        //              (e) => {
        //                 console.log(e);
        //             });
        //     },
        //      (e) => {
        //         console.log(e);
        //     });

        // this.filepath.resolveNativePath(imageData).then(res => {
        //   console.log('filepath');
        //   console.log(res);
        // });
      //   window.resolveLocalFileSystemURL(imageData, function success(fileEntry) {
      //   console.log('got file: ' + fileEntry.fullPath);
      //   console.log('cdvfile URI: ' + fileEntry.toInternalURL());
      // });
      }, (err) => {
        // Handle error
        console.log(err);
      });
  }
  https(url: string) {
    if (url.indexOf('https') !== -1) {
      return url;
    } else {
      return url.replace('http', 'https');
    }
  }
  close() {
    this.modalController.dismiss();
  }

  pickMediaCapacitor(mediaType) {
      CameraCapacitor.getPhoto({
          quality: 50,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos
      }).then(image => {
          const imageUrl = image.webPath;
          this.selectedImage.push(image.webPath);
      },
          error => console.log(error));
  }
}
