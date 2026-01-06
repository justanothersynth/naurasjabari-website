## Website Content Editing

General website content such as pictures and text can be edited through the **Pages** tab above.

### Content

On the **Pages** tab, you will find the following areas:

##### Home, About and Definitions

These areas contain content for each of the website pages of the same name.

##### Site Header

This area contains the content for the top-most part of the website, such as the logo, the introductory text and the labels for each button (re: "Home", "Search Data", etc.)

##### Site Footer

This area contains the content for the bottom-most part of the website, such as the partner organization logos, the address, the copyright text, etc.

**→→→ IMPORTANT**: make sure to click the "Save" button at the bottom of the area you are editing. **Each area has a _separate_ save button**. Clicking save in one area will **NOT** save another area.

### Making Edits to Fields

##### Simple text fields

Text can be entered directly but cannot be formatted

##### Rich text fields

Text can be formatted using any of several methods:

  - <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" target="_blank">Markdown markup</a> can be used and will be applied while typing
  - The toolbar at the top of the rich text editor can be used. Click the `•••` button for more options
  - Keyboard shortcuts can be used. For example, `cmd-b` (macOS) or `ctrl-b` (Windows) will **bold** text

##### Images

Click on an existing image to open the file selector. Once you select an image, it will be uploaded automatically.

## Application Data (CSV) Editing

##### Results

In the **Results** section, you will be able to upload a new `results.csv` file. You can drag the new CSV file onto the upload area (indicated by a dashed border and gray background) or you can click on the upload area and select a CSV file from your computer.

After you select a CSV file, you will see an indicator that goes from `uploading` to `processing`. Once processing is complete, you will see a message that shows you how many results were successfully imported and how many failed with an error. CSV rows (lines) that contain an error are listed to make it easier to find the error and correct it.

##### Outcome

Outcomes can be edited in the `outcome.csv` file.

Outcomes are grouped in "blocks" and each block is separated by an empty row. Each outcome block must have a unique "key". Every row that contains this key will group all the values together within the inputted outcome.

For example, let's say we wanted to create a new outcome block called "Suicide Completion" and several entries to this block. In `outcome.csv`, we would:

1. Think of a unique key that represents this outcome. The best bet is to simply use the first letter of every word in the name of the outcome. In this case the key could be `sc`.

  ```
  Key,Label,Primary,Secondary
  sc,Suicide Completion,SC (Suicide Completion),SC (Suicide Completion)
  ```

2. Input more entries to this outcome block directly after the previous one.

  ```
  Key,Label,Primary,Secondary
  sc,Suicide Completion,SC (Suicide Completion),SC (Suicide Completion)
  sc,Suicide Completion,SC (Suicide Completion),SC
  sc,Suicide Completion,SC (Suicide Completion),Incident SC
  sc,Suicide Completion,SC (Suicide Completion),Prevalent SC
  sc,Suicide Completion,SC (Suicide Completion),SC at first year follow-up
  sc,Suicide Completion,SC (Suicide Completion),SC at 13 years follow-up
  ```

3. Once entries are inputted, add an empty row below in order to visually separate the new block.

  ```
  Key,Label,Primary,Secondary
  sc,Suicide Completion,SC (Suicide Completion),SC (Suicide Completion)
  sc,Suicide Completion,SC (Suicide Completion),SC
  sc,Suicide Completion,SC (Suicide Completion),Incident SC
  sc,Suicide Completion,SC (Suicide Completion),Prevalent SC
  sc,Suicide Completion,SC (Suicide Completion),SC at first year follow-up
  sc,Suicide Completion,SC (Suicide Completion),SC at 13 years follow-up
  ,,,
  ```

##### Estimator

Adding estimators is a little bit more complicated because there are 2 types of groupings inside a single CSV file.

1. Type **definition**

  A "definition" Type is where you define a new type of estimator. Each definition _must be unique_. A unique key must be created for each definition and added as a separate row. The name, label and description of each definition can be added as well.

  The definition is able to group together multiple keywords from `results.csv`. For example, let's say we wanted to add a new definition called "Subhazard Ratio" and we wanted this definition to represent (match) the following keywords: "subhazard ratio" and "sub hazard ratio". We could create the following row in the CSV file:

  ```
  Type,Match,Description,Name,Label,Key
  definition,subhazard ratio|sub hazard ratio,the instantaneous rate of occurrence...,Subhazard Ratio,SHR,shr
  ```

  **The `match` entries must be all lowercase**. So if the entry in the result is like this "The Instantaneous Rate of Occurrence", it must be entered into the match column like this "the instantaneous rate of occurrence".

  Let's break the entry down:

  - **Type**: "definition"
  - **Match**: "subhazard ratio|sub hazard ratio"
  - **Description**: "The instantaneous rate of occurrence..."
  - **Name**: "Subhazard Ratio"
  - **Label**: "SHR"
  - **Key**: "shr"

  Notice that the **Match** contains entries separated by a "pipe" character (`|`)

2. Type **group**

  A "group" Type refers to the groupings found within the table after a user clicks on a result in the chart. A grouping can only consist of entries that are already inputted as definitions. For example, let's say we wanted to group "hr" and "shr", we could create the following row:

  ```
  Type,Match,Description,Name,Label,Key
  group,hr|shr,HR and SHR,,,
  ```

  Let's break the entry down:

  - **Type**: "group"
  - **Match**: "hr|shr"
  - **Description**: "HR and SHR"
  - **Name**: n/a
  - **Label**: n/a
  - **Key**: n/a

  Notice that the **Match** contains entries separated by a "pipe" character (`|`). As well, the "description" field corresponds to the heading that appears above each grouping in the results table.

## Downloading Files

Clicking on the **Download Files** button in the top menu will download a ZIP file that contains the following _most recently uploaded_ versions of the following files:

- estimator.csv
- outcome.csv
- results.csv

Whenever you want to make changes to the results or groupings, it is highly recommended that you download these files, make changes to them, and then re-upload them.
