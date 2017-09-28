# Conventions

## Adding a new trigger

The following are the steps required to add a new Trigger to the system:

- Create a new view in the namespace 'app.editor.triggers' with a name that matches the name of the server side module responsible for implementing the logic of the trigger.
- Add a <select> options to the 'trigger-type-template' so that the new trigger becomes selectable
- Create a template to represent the parameters of the trigger
- Handle events in custom view to make sure that the parameters of the model are updated correctly
- add factory function to namespace 'app.Factory' that instantiates default values for trigger template 
