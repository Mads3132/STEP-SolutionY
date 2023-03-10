import BaseController from "./BaseController";
import formatter from "../model/formatter";
import Component from "../Component";
import Event from "sap/ui/base/Event";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";

/**
 * @namespace schema.TimeRegistry.controller
 */
export default class Main extends BaseController {
	private formatter = formatter;
	private component: Component;
	private _tmpUsername: String = "";
	private oModel: ODataModel;

	onInit() {
		this.component = this.getOwnerComponent();
		this.oModel = this.getModel() as ODataModel;
	}

	async onLoginPress(ev: Event) {
		let object;
		const model = this.getModel() as ODataModel;

		// Validate that the user exists
		try {
			object = await model.bindContext(`/UserSet(${this._tmpUsername})`).requestObject();
		} catch (err: any) {
			if (err.message == 'Not Found') alert("Error: User not found");
			else alert(err.message);
			return;
		}

		// Set Control Model data
		await this.component.getControlModel().setProperty("/Username", this._tmpUsername);
		await this.component.getControlModel().setProperty("/Firstname", object.firstname);
		await this.component.getControlModel().setProperty("/Lastname", object.lastname);

		// Navigate to registration page
		this.component.getRouter().navTo("register");
	}

	onUsernameInputChange(ev: Event) {
		this._tmpUsername = ev.getParameter("value");
	}

	


}
