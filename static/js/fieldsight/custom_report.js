function assigntoken(csrf){
  csrf_token=csrf;
  
}
function StageViewModel(url) {
  var self=this;
  self.generalforms = ko.observableArray();
  self.scheduledforms = ko.observableArray();
  self.stageforms = ko.observableArray();
  self.allformjson = ko.observableArray();
  self.stageForm = ko.observable();
  self.generalForm = ko.observable();
  self.scheduleForm = ko.observable();

  
  self.setSelected = function(item){
     
          ko.utils.arrayForEach(item.forms, function(child) {
             
              child.selected((item.selected()));
              ko.utils.arrayForEach(child.forms, function(subchild) {
             
              subchild.selected((child.selected()));
             
             });
             
             });

  return true;
          
     
    
  }; 

  self.data = ko.observable();
  self.generateReport = function(){
    App.showProcessing();
    var selectedFormids = [];
          ko.utils.arrayForEach(self.allformjson(), function(item) {
            
                if (item().selected() === true){
                    ko.utils.arrayForEach(item().forms, function(child) {

                        if (child.selected() === true){

                            if (item().xf_title != "Stage Forms"){

                                selectedFormids.push(child.id);
                            }
                            else{

                                ko.utils.arrayForEach(child.forms, function(subchild) {
                                    if (subchild.selected() === true){
                                      selectedFormids.push(subchild.id);        
                                    }                                             
                                });    
                            }
                        }          
                    });           
                }  
             });
    console.log(selectedFormids);
    
    self.data({'fs_ids':selectedFormids});
    

    var success =  function (response) {
                App.hideProcessing();

                App.notifyUser(
                        'Generating',
                        'success'
                    );

            };
                App.hideProcessing();
   
    var failure =  function (errorThrown) {
      var err_message = errorThrown.responseJSON[0];
                App.notifyUser(
                        err_message,
                        'error'
                    );

            };
          console.log(csrf_token);
       App.remotePost(url, ko.toJS(self.data()), success, failure);  
};


  self.loadData = function(url){
      // App.showProcessing();

          $.ajax({
              url: url,
              method: 'GET',
              dataType: 'json',
              

              success: function (response) {
                 self.generalForm({'xf_title':'General Forms', 'level':'1', 'forms':[], 'selected': ko.observable(false) });
                 var mappedGeneralData = ko.utils.arrayMap(response.general, function(item) {
                            datas = {'id': item.id, 'xf_title': item.xf__title, 'level':'2', 'forms':[], 'selected': ko.observable(false)};
                            return datas;
                        });
                 self.generalForm().forms.push.apply(self.generalForm().forms, mappedGeneralData);

                 self.scheduleForm({'xf_title':'Schedule Forms', 'level':'1', 'forms':[], 'selected': ko.observable(false)});
                 var mappedScheduleData = ko.utils.arrayMap(response.schedule, function(item) {
                            datas = {'id': item.id, 'xf_title': item.xf__title, 'level':'2', 'forms':[], 'selected': ko.observable(false)};
                            return datas;
                        });
                 self.scheduleForm().forms.push.apply(self.scheduleForm().forms, mappedScheduleData);

                 self.stageForm({'xf_title':'Stage Forms', 'level':'1', 'forms':[], 'selected': ko.observable(false)});
                 var mappedStageData = ko.utils.arrayMap(response.stage, function(item) {
                        var sub_stages = ko.utils.arrayMap(item.sub_stages, function(subitem) {
                            sub_datas = {'id': subitem.stage_forms__id, 'xf_title': subitem.stage_forms__xf__title, 'forms':[], 'level':'3', 'selected': ko.observable(false)};
                            return sub_datas;
                        });
                        stage_data = {'id': item.id, 'xf_title': item.title, 'level':'2', 'forms':sub_stages, 'selected': ko.observable(false)};                      
                        return stage_data;
                    });
                 self.stageForm().forms.push.apply(self.stageForm().forms, mappedStageData);

                 self.allformjson.push(self.generalForm);
                 self.allformjson.push(self.scheduleForm);
                 self.allformjson.push(self.stageForm); 

                App.hideProcessing();
                },
              error: function (errorThrown) {
                  App.hideProcessing();
                  console.log(errorThrown);
              }
          });
    };

  

  self.loadData(url);
}
