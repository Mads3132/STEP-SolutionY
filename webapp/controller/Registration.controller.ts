import BaseController from "./BaseController";
import formatter from "../model/formatter";
import Component from "../Component";
import Event from "sap/ui/base/Event";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import StandardListItem from "sap/m/StandardListItem";
import Dialog from "sap/m/Dialog";
import DateTimePicker from "sap/m/DateTimePicker";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import Fragment from "sap/ui/core/Fragment";
import Context from "sap/ui/model/odata/v4/Context";

/**
 * @namespace schema.TimeRegistry.controller
 */
export default class Registration extends BaseController {
    timedialog: any;
    selectedObject: any;

    onInit(): void{
        this.getRouter().getRoute("register").attachPatternMatched(this._onPatternMatched, this);

    }

    private _onPatternMatched (){
        const controlModel= this.getOwnerComponent().getControlModel();
        console.log(controlModel);
        this.getView().bindElement(`/UserSet(${controlModel.getProperty("/Username")})`,{expand:"projects"}); //måske ID stedet for projects
    }

    async onListItemPress(ev: Event){
        let src = ev.getSource() as StandardListItem;
        let binding = src.getBindingContext().getObject() as any;
        this.selectedObject = binding;

        if (!this.timedialog){
            this.timedialog = (await this.loadFragment({name: "schema.TimeRegistry.view.fragments.timedialog"})) as Dialog;

        }
        this.timedialog.bindElement(`/Project(${binding.projectID})`);
        this.timedialog.open();


    }

    onPressSubmit(ev: Event){
        const model = this.getModel();
        const sdPicker = this.byId("DTPStart") as DateTimePicker;
        const edPicker = this.byId("DTPEnd") as DateTimePicker;

        const sdValue = sdPicker.getDateValue();
        const edValue = edPicker.getDateValue();

        if(!sdValue || !edValue){
            alert("Please select both a start and end time!")
            return;
        }

        let payload = {
            data : {
                project_ID:this.selectedObject.projectID,
                user_ID:this.selectedObject.userID,
                workHourStartTime: sdValue,
                workHourEndTime: edValue,
            }
            
        };

        const registerHours = model.bindList("/RegisterHours") as ODataListBinding;
        registerHours //HourRegistrationRequest ?
            .create(payload)
            .created()
            .then(res => {
                this.timedialog.close();
            })
    }

    onPressCancel(ev: Event){
        this.timedialog.close();
    }

}
