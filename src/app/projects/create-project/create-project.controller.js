/*
 * Copyright (c) 2015 Codenvy, S.A.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Codenvy, S.A. - initial API and implementation
 */
'use strict';

/**
 * This class is handling the controller for the projects
 * @author Florent Benoit
 */
class CreateProjectCtrl {

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor (codenvyAPI, $filter, $timeout, $location, $mdDialog) {
    this.codenvyAPI = codenvyAPI;
    this.$timeout = $timeout;
    this.$location = $location;
    this.$mdDialog = $mdDialog;


    // fetch workspaces when initializing
    let promise = codenvyAPI.getWorkspace().fetchWorkspaces();

    // keep references on workspaces and projects
    this.workspaces = [];


    this.importingData = '';

    promise.then(() => {
        this.updateData();
      },
      (error) => {
        if (error.status === 304) {
          // ok
          this.updateData();
          return;
        }
        this.state = 'error';
      });

    this.currentTab = '';

    this.forms = new Map();

    this.importProjectData = {
      source: {
        project: {
          location: '',
          type: ''
        }
      },
      project: {
        name: '',
        description: '',
        type: 'blank',
        visibility: 'public'
      }
    };

    this.importProjectData.source.project.type = 'git';

    let promiseTypes = codenvyAPI.getProjectType().fetchTypes();


    promiseTypes.then(() => {
        this.updateTypes();
      },
      (error) => {
        if (error.status === 304) {
          // ok
          this.updateTypes();
          return;
        }
        this.state = 'error';
      });


    this.jsonConfig = {};
    this.jsonConfig.content = '{}';
    try {
      this.jsonConfig.content = $filter('json')(angular.fromJson(this.importProjectData), 2);
    } catch (e) {
      // ignore the error
    }


    this.importing = false;
  }




  updateData() {
    this.workspaces = this.codenvyAPI.getWorkspace().getWorkspaces();
    this.workspaceSelected = this.workspaces[0];

    // init WS bus
    this.messageBus = this.codenvyAPI.getWebsocket().getBus(this.workspaceSelected.workspaceReference.id);
  }

  updateTypes() {
    this.typesByCategory = this.codenvyAPI.getProjectType().getTypesByCategory();
  }





  refreshCM() {
    // hack to make a refresh of the zone
    this.importProjectData.cm = 'aaa';
    this.$timeout(() => { delete this.importProjectData.cm;}, 500);
  }

  update() {
    try {
      this.importProjectData = angular.fromJson(this.jsonConfig.content);
    } catch (e) {
      // invalid JSON, ignore
    }

  }



  selectGitHubRepository(gitHubRepository) {
    this.importProjectData.project.name = gitHubRepository.name;
    this.importProjectData.project.description = gitHubRepository.description;
    this.importProjectData.source.project.location = gitHubRepository.clone_url;
  }


  checkValidFormState() {
    // check project information form and selected tab form
    var currentForm = this.forms.get(this.currentTab);

    if (currentForm) {
      return this.projectInformationForm.$valid && currentForm.$valid;
    } else {
      return this.projectInformationForm.$valid;
    }
  }

  setProjectInformationForm(form) {
    this.projectInformationForm = form;
  }


  setForm(form, mode) {
    this.forms.set(mode, form);
  }

  setCurrentTab(tab) {
    this.currentTab = tab;
    if ('zip' === tab) {
      this.importProjectData.source.project.type = 'zip';
    } else if ('git' === tab) {
      this.importProjectData.source.project.type = 'git';
    }
  }


  import() {
    var promise;
    console.log('importing, this', this);

    // check worspace is selected
    if (!this.workspaceSelected || !this.workspaceSelected.workspaceReference) {
      this.$mdDialog.show(
        this.$mdDialog.alert()
          .title('No workspace selected')
          .content('No workspace is selected')
          .ariaLabel('Project creation')
          .ok('OK')
      );
      return
    }

    this.importing = true;

    var mode = '';
    var channel = 'importProject:output:' + this.workspaceSelected.workspaceReference.id + ':' + this.importProjectData.project.name;
    if (this.currentTab === 'blank') {
      // no source, data is .project subpart
      promise = this.codenvyAPI.getProject().createProject(this.workspaceSelected.workspaceReference.id, this.importProjectData.project.name, this.importProjectData.project);
      mode = 'createProject';
    } else {
      mode = 'importProject';
      // on import
      this.messageBus.subscribe(channel, (message) => {
        this.importingData = message.line;
      });

      promise = this.codenvyAPI.getProject().importProject(this.workspaceSelected.workspaceReference.id, this.importProjectData.project.name, this.importProjectData);
    }
    promise.then((data) => {
      this.importing = false;
      this.importingData = '';

      if (mode === 'importProject') {
        data = data.projectDescriptor;
      }

      // need to redirect to the project details as it has been created !
      this.$location.path('project/' + data.workspaceId + '/' + data.name);

      this.messageBus.unsubscribe(channel);

    }, (error) => {
      this.messageBus.unsubscribe(channel);
      this.importing = false;
      this.importingData = '';
      // need to show the error
      this.$mdDialog.show(
        this.$mdDialog.alert()
          .title('Error while creating the project')
          .content(error.statusText + ': ' + error.data.message)
          .ariaLabel('Project creation')
          .ok('OK')
      );
    });


  }

  cdvySelecter(name, valueSelected) {
    this.importProjectData.project.type = valueSelected.id;
  }

  isImporting() {
    return this.importing;
  }


}

export default CreateProjectCtrl;
