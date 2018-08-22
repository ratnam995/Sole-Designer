import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import 'fabric';
import { HttpService } from '../shared/services/http-service';
declare const fabric: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  private canvas: any;
  private props: any = {
    id: null,
    opacity: null,
    fill: null,
    fontSize: null,
    lineHeight: null,
    charSpacing: null,
    fontWeight: null,
    fontStyle: null,
    textAlign: null,
    fontFamily: null,
    TextDecoration: ''
  };

  private textString: string;
  private urlList: string[] = [];
  private size: any = {
    width: 500,
    height: 800
  };

  private textEditor: boolean = false;
  private imageEditor: boolean = false;
  private selected: any;

  public previousFileListLoaded:boolean= false;
  public previousFiles=[];
  public fileName="";

  constructor(
    private router: Router,
    private httpService: HttpService
  ) { }

  ngOnInit() {
    this.fetchPreviouslySavedCanvasNames();
    this.canvas.clipTo = function (ctx){
        ctx.strokeStyle = '#999999';
        ctx.beginPath();
        ctx.moveTo(220,100);
        ctx.lineTo(280,100);
        ctx.lineTo(350,105);
        ctx.lineTo(410,120);
        ctx.lineTo(410,180);
        ctx.lineTo(350,170);
        ctx.lineTo(350,370);
        ctx.lineTo(350,370);
        ctx.lineTo(160,370);
        ctx.lineTo(160,170);
        ctx.lineTo(100,180);
        ctx.lineTo(100,120);
        ctx.lineTo(160,105);
        ctx.closePath();
        ctx.stroke();
    }

    this.canvas.on({
      'object:moving': (e) => { },
      'object:modified': (e) => { },
      'object:selected': (e) => {

        let selectedObject = e.target;
        this.selected = selectedObject
        selectedObject.hasRotatingPoint = true;
        selectedObject.transparentCorners = false;
        this.resetPanels();

        if (selectedObject.type !== 'group' && selectedObject) {

          this.getItemId();
          this.getItemOpacity();

          switch (selectedObject.type) {
            case 'i-text':
              this.textEditor = true;
              this.getLineHeight();
              this.getCharSpacing();
              this.getBold();
              this.getFontStyle();
              this.getFill();
              this.getTextDecoration();
              this.getTextAlign();
              this.getFontFamily();
              break;
            case 'image':
              break;
          }
        }
      },
      'selection:cleared': (e) => {
        this.selected = null;
        this.resetPanels();
      }
    });

    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }


  fetchPreviouslySavedCanvasNames(){
    this.previousFiles=[];
    if(localStorage.getItem('userID')){
      this.httpService.post("fetchCanvasNames", { userID: localStorage.getItem('userID')})
      .subscribe((response)=>{
        if(response.hasOwnProperty("success")){
          if(response.hasOwnProperty('results') && response.results.length){
            this.previousFiles= response.results.map(singleResponseObj=> singleResponseObj.canvas_name);
          }
          else{
            this.previousFiles=[];
          }
        }
        else{
          this.previousFiles=[];
        }
        this.previousFileListLoaded=true;
      },
      (error)=>{
        console.log("Error while fetching canvas names", error);
      });
      this.canvas = new fabric.Canvas('canvas', {
        hoverCursor: 'pointer',
        selection: true,
        selectionBorderColor: 'blue'
      });
    }
    else{
      if(confirm("Please login again")){
        this.router.navigate(['']);
      }
    }
  }

  changeSize(event: any) {
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }

  addTextToCanvas() {
    let textString = this.textString;
    let text = new fabric.IText(textString, {
      left: 170,
      top: 200,
      fontFamily: 'helvetica',
      angle: 0,
      fill: '#000000',
      scaleX: 0.5,
      scaleY: 0.5,
      fontWeight: '',
      hasRotatingPoint: true
    });
    this.extend(text, this.generateItemId());
    this.canvas.add(text);
    this.selectItemAfterAdded(text);
    this.textString = '';
  }

  addImageToCanvas(url) {
    if (url) {
      fabric.Image.fromURL(url, (image) => {
        image.set({
          left: 10,
          top: 10,
          angle: 0,
          padding: 10,
          cornersize: 10,
          hasRotatingPoint: true
        });
        image.setWidth(200);
        image.setHeight(200);
        this.extend(image, this.generateItemId());
        this.canvas.add(image);
        this.selectItemAfterAdded(image);
      });
    }
  }

  readFileUrl(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event) => {
        this.urlList.push(event.target['result']);
      }
      reader.readAsDataURL(event.target.files[0]);
      event.target.value='';
    }
  }

  removeImages() {
    this.urlList = [];
  };

  removeSelection() {
    this.canvas.deactivateAllWithDispatch().renderAll();
  }

  selectItemAfterAdded(obj) {
    this.canvas.deactivateAllWithDispatch().renderAll();
    this.canvas.setActiveObject(obj);
  }

  extend(obj, id) {
    obj.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id: id
        });
      };
    })(obj.toObject);
  }

  generateItemId() {
    return Math.floor(Math.random() * 999999) + 1;
  }

  getActiveStyle(styleName, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) return '';

    return (object.getSelectionStyles && object.isEditing)
      ? (object.getSelectionStyles()[styleName] || '')
      : (object[styleName] || '');
  }

  setActiveStyle(styleName, value, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) return;

    if (object.setSelectionStyles && object.isEditing) {
      var style = {};
      style[styleName] = value;
      object.setSelectionStyles(style);
      object.setCoords();
    }
    else {
      object.set(styleName, value);
    }

    object.setCoords();
    this.canvas.renderAll();
  }


  getActiveProp(name) {
    var object = this.canvas.getActiveObject();
    if (!object) return '';

    return object[name] || '';
  }

  setActiveProp(name, value) {
    var object = this.canvas.getActiveObject();
    if (!object) return;
    object.set(name, value).setCoords();
    this.canvas.renderAll();
  }

  cloneItem() {
    let activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      let clone;
      switch (activeObject.type) {
        case 'i-text':
          clone = new fabric.IText('', activeObject.toObject());
          break;
        case 'image':
          clone = fabric.util.object.clone(activeObject);
          break;
      }
      if (clone) {
        clone.set({ left: 150, top: 100 });
        this.canvas.add(clone);
        this.selectItemAfterAdded(clone);
      }
    }
  }

  getItemId() {
    if(this.canvas && this.canvas.getActiveObject())
      this.props.id = this.canvas.getActiveObject().toObject().id;
  }

  setItemId() {
    let val = this.props.id;
    let complete = this.canvas.getActiveObject().toObject();
    this.canvas.getActiveObject().toObject = () => {
      complete.id = val;
      return complete;
    };
  }

  getItemOpacity() {
    this.props.opacity = this.getActiveStyle('opacity', null) * 100;
  }

  setItemOpacity() {
    this.setActiveStyle('opacity', parseInt(this.props.opacity) / 100, null);
  }

  getFill() {
    this.props.fill = this.getActiveStyle('fill', null);
  }

  getLineHeight() {
    this.props.lineHeight = this.getActiveStyle('lineHeight', null);
  }

  setLineHeight() {
    this.setActiveStyle('lineHeight', parseFloat(this.props.lineHeight), null);
  }

  getCharSpacing() {
    this.props.charSpacing = this.getActiveStyle('charSpacing', null);
  }

  setCharSpacing() {
    this.setActiveStyle('charSpacing', this.props.charSpacing, null);
  }

  getFontSize() {
    this.props.fontSize = this.getActiveStyle('fontSize', null);
  }

  setFontSize() {
    this.setActiveStyle('fontSize', parseInt(this.props.fontSize), null);
  }

  getBold() {
    this.props.fontWeight = this.getActiveStyle('fontWeight', null);
  }

  setBold() {
    this.props.fontWeight = !this.props.fontWeight;
    this.setActiveStyle('fontWeight', this.props.fontWeight ? 'bold' : '', null);
  }

  getFontStyle() {
    this.props.fontStyle = this.getActiveStyle('fontStyle', null);
  }

  setFontStyle() {
    this.props.fontStyle = !this.props.fontStyle;
    this.setActiveStyle('fontStyle', this.props.fontStyle ? 'italic' : '', null);
  }

  getTextDecoration() {
    this.props.TextDecoration = this.getActiveStyle('textDecoration', null);
  }

  setTextDecoration(value) {
    let iclass = this.props.TextDecoration;
    if (iclass.includes(value)) {
      iclass = iclass.replace(RegExp(value, "g"), "");
    } else {
      iclass += ` ${value}`
    }
    this.props.TextDecoration = iclass;
    this.setActiveStyle('textDecoration', this.props.TextDecoration, null);
  }

  hasTextDecoration(value) {
    return this.props.TextDecoration.includes(value);
  }

  getTextAlign() {
    this.props.textAlign = this.getActiveProp('textAlign');
  }

  setTextAlign(value) {
    this.props.textAlign = value;
    this.setActiveProp('textAlign', this.props.textAlign);
  }

  getFontFamily() {
    this.props.fontFamily = this.getActiveProp('fontFamily');
  }

  setFontFamily() {
    this.setActiveProp('fontFamily', this.props.fontFamily);
  }

  removeSelectedItem() {
    let activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      this.canvas.remove(activeObject);
      // this.textString = '';
    }
    else if (activeGroup) {
      let objectsInGroup = activeGroup.getObjects();
      this.canvas.discardActiveGroup();
      let self = this;
      objectsInGroup.forEach(function (object) {
        self.canvas.remove(object);
      });
    }
  }

  bringItemToFront() {
    let activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      activeObject.bringToFront();
      // activeObject.opacity = 1;
    }
    else if (activeGroup) {
      let objectsInGroup = activeGroup.getObjects();
      this.canvas.discardActiveGroup();
      objectsInGroup.forEach((object) => {
        object.bringToFront();
      });
    }
  }

  sendItemToBack() {
    let activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      activeObject.sendToBack();
      // activeObject.opacity = 1;
    }
    else if (activeGroup) {
      let objectsInGroup = activeGroup.getObjects();
      this.canvas.discardActiveGroup();
      objectsInGroup.forEach((object) => {
        object.sendToBack();
      });
    }
  }

  confirmClear() {
    if (confirm('Are you sure?')) {
      this.canvas.clear();
    }
  }

  fileSelected(event){
    this.fileName="";
    if(event.target.value){
      let reqObj={
        userID: localStorage.getItem("userID"),
        canvasName: event.target.value
      }
      this.httpService.post('fetchCanvas', reqObj)
      .subscribe((response)=>{
        this.fileName=response.results[0].canvas_name;
        this.loadCanvasFromJSON(response.results[0].canvas_json);
      })
    }
    else{
      this.canvas.clear();
    }
  }
  
  saveCanvasToJSON() {
    let json = JSON.stringify(this.canvas);
    if(localStorage.getItem('userID')){
      var fileName = prompt("Please enter file name", this.fileName.length? this.fileName: "");
      let canvasObj={
        userID: localStorage.getItem('userID'),
        canvasJSON: json,
        canvasName: fileName
      }
      if (fileName && fileName.length) {
        if(this.fileName.length){
          this.httpService.update('updateCanvas', canvasObj)
          .subscribe(
            (response)=>{
              if(response.hasOwnProperty('success')){
                alert("SuccessFully Updated.");
                this.fetchPreviouslySavedCanvasNames();
              }
              else{
                if(response.hasOwnProperty('error')){
                  alert("Update failed");
                }
              }
            },
            (error)=>{
              alert("Update failed");
            }
          )
        }
        else{
          this.httpService.post('saveCanvas', canvasObj)
          .subscribe(
            (response)=>{
              if(response.hasOwnProperty('success')){
                alert("SuccessFully Saved.");
                this.fetchPreviouslySavedCanvasNames();
              }
              else{
                if(response.hasOwnProperty('error')){
                  alert("Save failed");
                }
              }
            },
            (error)=>{
              alert("Save failed");
            })
        }
      }

    }
    else{
      this.router.navigate(['']);
    }

  }

  loadCanvasFromJSON(canvasJson) {
    this.canvas.loadFromJSON(canvasJson, () => {
      this.canvas.renderAll();
    });

  }

  resetPanels() {
    this.textEditor = false;
    this.imageEditor = false;
  }

  onLogoutClick(){
    localStorage.clear();
    this.router.navigate(['']);
  }

  onSaveClick(){
    this.saveCanvasToJSON();
  }
}
