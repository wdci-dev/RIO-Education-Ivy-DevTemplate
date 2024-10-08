/**
 * @Author 		WDCi ()
 * @Date 		Jan 2024
 * @group 		
 * @Description 
 * @changehistory
 * ISS-XXXXXX dd-mm-yyyy name - description
 */
import { LightningElement, api, wire, track } from 'lwc';
import { promptInfo, promptError, promptWarning, promptSuccess } from 'c/toasterUtil';
import { getErrorMessage, logInfo, logError } from 'c/loggingUtil';
import { initCacheIdx } from 'c/lwcUtil';
import { shadeHexColorCode } from 'c/cssUtil';
import { customLabels } from 'c/labelLoader';

//refresh module
import { refreshApex } from '@salesforce/apex';
import { RefreshEvent, registerRefreshHandler, unregisterRefreshHandler } from 'lightning/refresh';

//Apex methods
import ctrlSample from '@salesforce/apex/REDU_<%= pascalCaseComponentName %>_LCTRL.sample';


export default class <%= pascalCaseComponentName %> extends LightningElement {
	
	//configurable attributes
    @api modalTitle;
    @api modalIconName;
	@api enableDebugMode = false;
	
	//internal attributes
	isScriptLoaded = false;
	isInitSuccess = false
	loadedLists = 0;
	
    //refresh handler
    refreshHandlerID;

    //local cache idx to force rerendering
    _cacheIdx;

    //wire attribute
    sampleWireResult;
    sampleResponse;

	//labels
	label = customLabels;
	
	//js library module 'lodash', 'stringutil', 'noheadercss', 'moment', 'fullcalendar', 'fcmoment', 'jquery', 'tooltips'
    modules = [];
	
	/**
     * @descripton library loader
     */
    handleLibLoadSuccess(event) {
        this.isScriptLoaded = true;
        this.isInitSuccess = true;
        
    }

    /**
     * @descripton library loader
     */
    handleLibLoadFail(event) {
        this.isScriptLoaded = true;
        this.isInitSuccess = false;
    }
	
    /**
     * @descripton rendered callback
     */
	renderedCallback(){

    }

    /**
     * @descripton connected callback
     */
    connectedCallback(){
		this.refreshHandlerID = registerRefreshHandler(this, this.refreshData);
        this._cacheIdx = initCacheIdx();
	}
	
    /**
     * @descripton disconnected callback
     */
	disconnectedCallback() {
		unregisterRefreshHandler(this.refreshHandlerID);
	}

    /**
     * @description Refresh data
     */
    refreshData() {
        this.consoleLog('refreshData');
        
        //update the cacheIdx if you need to force the wire method to get new data from apex
        this._cacheIdx = initCacheIdx();

        refreshApex(this.sampleWireResult);

        return new Promise((resolve) => {
            resolve(true);
        });

    }

    /**
     * @description Sample wire method that invoke apex controller to retrieve data
     * @param cacheIdx This is to force the wire method to get new data from apex, you don't need to have the variable declare in the apex. Please remove if you don't need it.
     */
    @wire(ctrlSample, {
        param1: "$param1",
        cacheIdx: "$_cacheIdx"
    })
    wireSampleRecord(result) {
        
        this.sampleWireResult = result;
        this.sampleResponse = null;

        if (result.data) {
            this.sampleResponse = JSON.parse(result.data.responseData);
            this.consoleLog(this.sampleResponse, true);
        } else if (result.error) {
            promptError(this.label.ERROR_LABEL, getErrorMessage(result.error));
        }

    }

    /**
     * @descripton Sample method that invoke apex controller
     */
    samplePostMethod() {
        this.toggleSpinner(1);

        try {
            
            ctrlSample({
                
            })
            .then(saveResult => {
                this.toggleSpinner(-1);
                promptSuccess(this.label.SUCCESS_LABEL, 'any message');

            })
            .catch(error => {
                promptError(this.label.ERROR_LABEL, getErrorMessage(error));
                this.toggleSpinner(-1);
                
            })            

        } catch (error) {
            this.toggleSpinner(-1);
            promptError(this.label.ERROR_LABEL, getErrorMessage(error));
        }
    }

    /**
     * @description Sample handle refresh button
     */
    handleRefreshOnclick(event) {
        
    }
	
    /**
     * @descripton Spinner loading status
     */
	get isLoading(){
        return this.loadedLists === 0 ? false : true;
    }

    /**
     * @descripton Spinner toggler
     */
	toggleSpinner(loadCount){
        this.loadedLists += loadCount;

        if(this.loadedLists <= 0){
            this.loadedLists = 0;
        }
    }
	
    /**
     * @descripton Console log for debugging
     */
	consoleLog(anything, isJson){
        logInfo('<%= pascalCaseComponentName %>', anything, this.enableDebugMode, isJson);
    }
	
}