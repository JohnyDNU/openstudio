import React, { Component } from "react"
import { intlShape } from "react-intl"
import PropTypes from "prop-types"
import { withRouter } from 'react-router'
import validator from 'validator'
import { v4 } from "uuid"
import { Link } from 'react-router-dom'

import ButtonCustomerEdit from "../../../components/ui/ButtonCustomerEdit"
import CustomerDisplayMemberships from "./CustomerDisplayMemberships"
import CustomerDisplaySubscriptions from "./CustomerDisplaySubscriptions"
import CustomerDisplayClasscards from "./CustomerDisplayClasscards"
import CustomerDisplayNotes from "./CustomerDisplayNotes"
import CustomerDisplayNoteForm from "./CustomerDisplayNoteForm"
import CustomerDisplayReconcileLaterClasses from "./CustomerDisplayReconcileLaterClasses"


class CustomerDisplay extends Component {
    constructor(props) {
        super(props)
        console.log("Customer display props:")
        console.log(props)
        this.videoStream = React.createRef()
        this.superSecretPictureCanvas = React.createRef()
    }

    PropTypes = {
        intl: intlShape.isRequired,
        customerID: PropTypes.integer,
        customers: PropTypes.object,
        edit_in_progress: PropTypes.boolean,
        onClickEdit: PropTypes.function
    }

    onClickStartCamera() {
        console.log('Customer Display component DidMount')
        this.props.onClearCameraAppSnap()
        // var constraints = { audio: false, video: { facingMode: 'user' } }
        if (navigator.mediaDevices.getUserMedia) {       
            navigator.mediaDevices.getUserMedia({video: true})
          .then(stream => {
            this.videoStream.current.srcObject = stream
          })
          .catch(error => {
            console.log("Something went wrong while trying to stream video!");
            console.log(error)
          });
        }
    }

    onClickRedoPhoto() {
        console.log("another day, another chance")
        this.props.onClearCameraAppSnap()
        this.videoStream.current.play()
    }

    onClickSavePhoto() {
        console.log("saved for eternity")

        this.props.onSaveCameraAppSnap(
            this.props.customers.displayID,
            this.props.customers.camera_app_snap
        )

        document.getElementById("btnCloseModal").click()

        // Stop video playback of stream.
        var tracks = this.videoStream.current.srcObject.getTracks()
        var i
        for (i = 0; i < tracks.length; i++) {
            tracks[i].stop()
        }
    }

    onClickTakePhoto() {
        console.log('say cheese!!')
        var snap = this.takeSnapshot()
        console.log(snap)

        // Show image. 

        // Set the href attribute of the download button to the snap url.
        // download_photo_btn.href = snap

        // Pause video playback of stream.
        this.videoStream.current.pause()
    }


    takeSnapshot(){
        // Here we're using a trick that involves a hidden canvas element.  
        var video = this.videoStream.current
        var hidden_canvas = this.superSecretPictureCanvas.current
        var context = hidden_canvas.getContext('2d');

        var width = video.videoWidth
        var height = video.videoHeight

        if (width && height) {

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = width;
            hidden_canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(video, 0, 0, width, height);

            // Turn the canvas image into a dataURL that can be used as a src for our photo.
            this.props.onSetCameraAppSnap(hidden_canvas.toDataURL('image/png'))
            return hidden_canvas.toDataURL('image/png')
        }
    }

    onCreateNote(e) {
        console.log('submit create note')
        e.preventDefault()
        console.log(e.target)
        const data = new FormData(e.target)

        console.log(data.values())
        this.props.createNote(this.props.customerID, data)
    }


    onUpdateNote(e) {
        console.log('submit update note')
        e.preventDefault()
        console.log(e.target)
        const data = new FormData(e.target)

        console.log(data.values())
        this.props.updateNote(
            this.props.customerID, 
            this.props.customers.selected_noteID, 
            data
        )
    }

    onUpdateNoteStatus(e) {
        console.log('update note status clicked')
        e.preventDefault()

        this.props.updateNoteStatus(
            this.props.customerID,
            this.props.customers.selected_noteID, 
        )
    }

    onClickCheckin(e) {
        e.preventDefault()
        console.log('checkin clicked')

        const notes = this.props.customers.notes.data
        let has_unprocessed_note = false
        if (notes) {
            var i;
            for (i = 0; i < notes.length; i++) { 
                console.log(notes[i])
                if (notes[i].Processed === false) {
                    console.log('unprocessed note found')
                    has_unprocessed_note = true
                    break
                }
            }
        }

        if (has_unprocessed_note) {
            this.props.setNotesCheckinCheck()
        } else {
            const customerID = this.props.customerID
            this.props.history.push("/classes/" + customerID)
        }
    }


    onClickToCheckIn(e) {
        const customerID = this.props.customerID
        
        // Clear check, so the list is shown when we go back to the customer
        // Until Check-in is clicked again
        this.props.clearNotesCheckinCheck()
        this.props.history.push("/classes/" + customerID)
    }

    onClickBackToNotes(e) {
        this.props.clearNotesCheckinCheck()
    }


    render() {
        const customerID = this.props.customerID
        const customers = this.props.customers
        const customers_list = this.props.customers.data
    
        const school_info = this.props.school_info
        // const memberships = this.props.memberships
        // const subscriptions = this.props.subscriptions
        // const classcards = this.props.classcards
        const edit_in_progress = this.props.edit_in_progress
        const onClickEdit = this.props.onClickEdit
        let videoClass
        let imgClass
        

        !(customers.camera_app_snap) ?
             imgClass = 'hidden' : videoClass = 'hidden'

        return (
            <div>
                { !(customerID) || (edit_in_progress) ? null :
                <div className="box box-solid"> 
                    <div className="box-header">
                        <h3 className="box-title">{customers_list[customerID].display_name}</h3>
                    </div>
                    <div className="box-body">
                        <div className="col-md-2">
                            <div className="customer-display-image">
                                <img src={customers_list[customerID].thumblarge}
                                     alt={customers_list[customerID].display_name} />
                            </div><br />
                            {/* <!-- Modal --> */}
                            <div className="modal fade" id="cameraModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" ref={this.modal}>
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                            <h4 className="modal-title" id="myModalLabel">Take picture for {customers_list[customerID].display_name}</h4>
                                        </div>
                                        <div className="modal-body">
                                            {/* Camera app */}
                                            <div className="camera-app">
                                                {/* <button id="start-camera" 
                                                        className="visible btn btn-default"
                                                        onClick={this.onClickStartCamera.bind(this)} >
                                                    Start camera
                                                </button> */}
                                                {/* Shop video stream when no snapshot has been taken from the camera. Otherwise show snapshot image */}
                                                <video id="camera-stream" 
                                                    className={videoClass}
                                                    autoPlay 
                                                    ref={this.videoStream} />
                                                <img id="snap" 
                                                    className={imgClass}
                                                    src={customers.camera_app_snap} />

                                                <p id="error-message"></p>

                                                {/* <!-- Hidden canvas element. Used for taking snapshot of video. --> */}
                                                <canvas ref={this.superSecretPictureCanvas}></canvas>
                                            </div>
                                            {/* Close camera app */}
                                        </div>
                                        {/* Close modal body */}
                                        <div className="modal-footer">
                                                {!(customers.camera_app_snap) ?
                                                        <button id="take-photo" 
                                                                className="btn btn-primary"
                                                                onClick={this.onClickTakePhoto.bind(this)} 
                                                                title="Take Photo">
                                                            <i className="fa fa-camera"></i>
                                                            { ' ' } Take picture
                                                        </button>
                                                    : 
                                                    <span>
                                                            <button id="redo-photo" 
                                                                    title="redo Photo" 
                                                                    className="btn btn-default"
                                                                    onClick={this.onClickRedoPhoto.bind(this)}>
                                                                <i className="fa fa-repeat"></i>
                                                                { ' ' } Redo picture
                                                            </button>        
                                                            <button id="download-photo" 
                                                                    download="selfie.png" 
                                                                    title="Save Photo" 
                                                                    className="btn btn-primary"
                                                                    onClick={this.onClickSavePhoto.bind(this)}>
                                                                <i className="fa fa-save"></i>
                                                                { ' ' } Save picture
                                                            </button>          
                                                    </span>
                                                }
                                            <button type="button" id="btnCloseModal" className="btn btn-default pull-left" data-dismiss="modal">Close</button>
                                        </div> 
                                        {/* Close modal footer */}
                                    </div>
                                    {/* Close modal content */}
                                </div>
                                {/* Close modal-dialog */}
                            </div> 
                            {/* Close modal */}
                        </div> 
                        {/* Close md-4 */}
                        <div className="col-md-8">
                            <div className="col-md-3">
                                <label>Name</label><br/>
                                {customers_list[customerID].display_name}<br/>
                                <label>Email</label><br/>
                                {customers_list[customerID].email}<br/>
                                <label>Phone</label><br/>
                                {customers_list[customerID].mobile}<br/>
                                <label>Date of birth</label><br/>
                                {customers_list[customerID].date_of_birth}<br/>
                            </div>
                            <div className="col-md-3">
                                <CustomerDisplayMemberships data={school_info}/>
                                <CustomerDisplaySubscriptions data={school_info}/>
                                <CustomerDisplayClasscards data={school_info}/>
                            </div>
                            <div className="col-md-6">
                                {((customers.create_note) || (customers.update_note)) ?
                                    (customers.create_note) ?
                                        // Create note
                                        <CustomerDisplayNoteForm
                                            create={true}
                                            title="Add note" 
                                            errorData={this.props.createNoteErrorData}
                                            onSubmit={this.onCreateNote.bind(this)}
                                            onClickCancel={this.props.onClickCancelCreateNote}
                                        /> :
                                        // Update note
                                        <CustomerDisplayNoteForm
                                            title="Edit note" 
                                            update={true}
                                            updating_note_status={customers.updating_note_status}
                                            notes={customers.notes}
                                            selectedNoteID={customers.selected_noteID}
                                            errorData={this.props.updateNoteErrorData}
                                            onSubmit={this.onUpdateNote.bind(this)}
                                            onClickCancel={this.props.OnClickCancelUpdateNote}
                                            onChangeStatus={this.onUpdateNoteStatus.bind(this)}
                                        />
                                    :
                                    <CustomerDisplayNotes 
                                        customers={customers} 
                                        customerID={customers.displayID}
                                        OnClickUpdateNote={this.props.OnClickUpdateNote}
                                        onClickDeleteNote={this.props.onClickDeleteNote}
                                        onClickBack={this.onClickBackToNotes.bind(this)}
                                        onClickToCheckIn={this.onClickToCheckIn.bind(this)}
                                    />
                                } <br /><br />
                                <CustomerDisplayReconcileLaterClasses 
                                    data={school_info} 
                                    onClick={this.props.onClickCustomerDisplayClassReconcileLater}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <a href={`/customers/barcode_label?cuID=${customerID}`}
                               className="btn btn-default btn-flat btn-block"
                               target="_blank">
                                <i className="fa fa-id-card-o"></i> Print card   
                            </a>
                            <button type="button" 
                                    onClick={this.onClickStartCamera.bind(this)} 
                                    className="btn btn-default btn-flat btn-block" 
                                    data-toggle="modal" 
                                    data-target="#cameraModal">
                                <i className="fa fa-camera"></i> Take picture
                            </button> 
                            <button type="button"
                                    className="btn btn-default btn-flat btn-block" 
                                    onClick={this.onClickCheckin.bind(this)}
                            >
                                <i className="fa fa-check-square-o"></i> Class check-in    
                            </button>
                            <button type="button" 
                                    onClick={this.props.onClickCreateNote.bind(this)} 
                                    className="btn btn-default btn-flat btn-block">
                                <i className="fa fa-sticky-note-o"></i> Add note
                            </button>
                            <ButtonCustomerEdit onClick={onClickEdit}
                                                classAdditional='btn-flat btn-block'>
                                { ' ' } Edit customer
                            </ButtonCustomerEdit>
                        </div>
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default withRouter(CustomerDisplay)

