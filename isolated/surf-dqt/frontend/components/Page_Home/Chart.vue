<template>
  <div :class="['chart', { 'display-chart': displayChart }]">

    <FilterByDropdown
      :filter-by="filterByKey"
      @selectFilterBy="selectFilterBy" />

    <div class="placeholder">
      <span v-if="!firstSearchPerformed">
        Search this database and discover studies performed worldwide on suicidality. Select some options from the filters panel to begin.
      </span>
      <span v-else>
        No results found, please try another search.
      </span>
    </div>

    <div v-if="results" class="container">

      <div class="table">

        <div class="row header">
          <div class="cell empty"></div>
          <div
            v-for="cell in outcomes"
            :key="cell.id"
            class="cell cell-header">
            <div class="cell-content">
              {{ cell.label }}
            </div>
          </div>
        </div>

        <div
          v-if="resultList.length > 0 && Object.keys(results).length === 0"
          class="row">
          <div class="cell-placeholder">
            Results were found but do not match the selected <span>{{ selectedFilter.filterByName }}</span> filter. Please select a different filter from the dropdown in the upper-left corner of this Chart.
          </div>
        </div>

        <div
          v-for="(row, key) in results"
          :key="key"
          class="row">

          <div class="cell cell-label">
            <div class="cell-content">
              {{ row.label }}
            </div>
          </div>

          <div
            v-for="(cell, index) in row.data"
            :key="index"
            class="cell cell-number">
            <div v-if="cell.count !== 0" class="cell-content">
              <button
                :class="['count', 'scale-' + getScale(cell.count), { selected: selected(key, index) }]"
                @click="selectResults(cell.results, key, index)">
                <span>{{ cell.count }}</span>
                <span class="ring"></span>
                <span class="ring"></span>
                <span class="ring"></span>
                <span class="ring"></span>
                <span class="ring"></span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters, mapActions } from 'vuex'

import FilterByDropdown from '@/components/Page_Home/FilterByDropdown'

// eslint-disable-next-line
const PLACEHOLDER = {"Adolescents with suicidal behavior or severe suicide thoughts":{"label":"Adolescents with suicidal behavior or severe suicide thoughts","data":[{"count":0,"results":[]},{"count":4,"results":[{"_id":"5ecd01bb50f1f4482a19b10e","firstAuthor":"Conway","year":"2017","country":"Denmark","outcome":"Actual SA","population":"Adolescents with suicidal behavior or severe suicide thoughts","riskFactor":"Actual attempt (modeled with SI severity) - SI severity and actual attempts at baseline mutually adjusted","comparator":"No","estimator":"OR","sizeEffect":"11.5","confidenceInterval":"CI95 [1.66–79.65]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b10f","firstAuthor":"Conway","year":"2017","country":"Denmark","outcome":"Actual SA","population":"Adolescents with suicidal behavior or severe suicide thoughts","riskFactor":"Actual attempt (modeled with SI with intent) - SI severity and actual attempts at baseline mutually adjusted","comparator":"No","estimator":"OR","sizeEffect":"11.97","confidenceInterval":"CI95 [1.72–83.21]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b114","firstAuthor":"Conway","year":"2017","country":"Denmark","outcome":"Actual SA","population":"Adolescents with suicidal behavior or severe suicide thoughts","riskFactor":"Deterrents - Adjusted for actual attempts at baseline","comparator":"","estimator":"OR","sizeEffect":"2.73","confidenceInterval":"CI95 [1.13–6.58]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b115","firstAuthor":"Conway","year":"2017","country":"Denmark","outcome":"Actual SA","population":"Adolescents with suicidal behavior or severe suicide thoughts","riskFactor":"Duration of SI - Adjusted for any type of suicidal behaviour at baseline","comparator":"","estimator":"OR","sizeEffect":"2.6","confidenceInterval":"CI95 [1.02–6.62]","pValue":"","design":"Cohort","__typename":"Result"}]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]}]},"Elderly men":{"label":"Elderly men","data":[{"count":29,"results":[{"_id":"5ecd01bb50f1f4482a19b15f","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Lung cancer (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"2.3","confidenceInterval":"CI95 [1.78–2.98]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b160","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Gastrointestinal cancer (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"2.54","confidenceInterval":"CI95 [1.86–3.48]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b161","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Bone cancer (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.36","confidenceInterval":"CI95 [1.00–1.84]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b162","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Genital cancer (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.58","confidenceInterval":"CI95 [1.26–1.97]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b163","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Bladder cancer (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"2.08","confidenceInterval":"CI95 [1.59–2.73]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b164","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Lymph node cancer (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.84","confidenceInterval":"CI95 [1.28–2.65]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b165","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Epilepsy (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.68","confidenceInterval":"CI95 [1.17–2.43]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b166","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Cerebrovascular diseases and hemiplegia (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.31","confidenceInterval":"CI95 [1.15–1.51]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b167","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Cataract (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.37","confidenceInterval":"CI95 [1.21–1.54]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b168","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Heart diseases (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.19","confidenceInterval":"CI95 [1.08–1.32]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b169","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Chronic Obstructive Pulmonary Disease (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.81","confidenceInterval":"CI95 [1.55–2.10]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b16a","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Gastrointestinal disorders (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.41","confidenceInterval":"CI95 [1.20–1.66]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b16b","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Liver diseases (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"2.69","confidenceInterval":"CI95 [1.73–4.17]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b16c","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Arthritis (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.38","confidenceInterval":"CI95 [1.08–1.77]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b16d","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Osteoporosis (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.75","confidenceInterval":"CI95 [1.10–2.78]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b16e","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Prostate disorders (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.38","confidenceInterval":"CI95 [1.20–1.57]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b16f","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Male genital disorders (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"2.43","confidenceInterval":"CI95 [1.26–4.68]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b170","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Spinal fracture (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.82","confidenceInterval":"CI95 [1.34–2.48]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b171","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Lung cancer (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.69","confidenceInterval":"CI95 [1.36–2.09]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b172","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Gastrointestinal cancer (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.92","confidenceInterval":"CI95 [1.50–2.44]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b173","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Genital cancer (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.46","confidenceInterval":"CI95 [1.21–1.76]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b174","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Bladder cancer (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.71","confidenceInterval":"CI95 [1.38–2.13]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b175","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Lymph node cancer (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.53","confidenceInterval":"CI95 [1.12–2.09]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b176","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Chronic Obstructive Pulmonary Disease (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.54","confidenceInterval":"CI95 [1.36–1.75]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b177","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Gastrointestinal disorders (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.23","confidenceInterval":"CI95 [1.11–1.37]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b178","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Liver diseases (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.4","confidenceInterval":"CI95 [1.02–1.93]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b179","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Arthritis (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.23","confidenceInterval":"CI95 [1.05–1.44]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b17a","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Arthrosis (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.16","confidenceInterval":"CI95 [1.03–1.32]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b17b","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly men","riskFactor":"Prostate disorders (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.38","confidenceInterval":"CI95 [1.27–1.50]","pValue":"","design":"Cohort","__typename":"Result"}]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]}]},"Elderly women":{"label":"Elderly women","data":[{"count":21,"results":[{"_id":"5ecd01bb50f1f4482a19b17c","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Lung cancer (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"3.16","confidenceInterval":"CI95 [2.11–4.73]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b17d","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Breast cancer (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.67","confidenceInterval":"CI95 [1.25–2.24]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b17e","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Cerebrovascular diseases and hemiplegia (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.41","confidenceInterval":"CI95 [1.16–1.72]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b17f","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Cataract (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.64","confidenceInterval":"CI95 [1.41–1.91]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b180","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Glaucoma (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.75","confidenceInterval":"CI95 [1.05–2.91]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b181","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Chronic Obstructive Pulmonary Disease (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"2","confidenceInterval":"CI95 [1.64–2.45]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b182","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Gastrointestinal disorders (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.67","confidenceInterval":"CI95 [1.37–2.04]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b183","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Liver diseases (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"4","confidenceInterval":"CI95 [2.51–6.37]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b184","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Osteoporosis (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.92","confidenceInterval":"CI95 [1.46–2.54]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b185","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Spinal fracture (diagnosed within 3 years)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"2.12","confidenceInterval":"CI95 [1.59–2.83]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b186","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Lung cancer (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"2.18","confidenceInterval":"CI95 [1.53–3.11]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b187","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Breast cancer (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.35","confidenceInterval":"CI95 [1.09–1.66]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b188","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Genital cancer (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.49","confidenceInterval":"CI95 [1.16–1.92]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b189","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Diabetes (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"0.6","confidenceInterval":"CI95 [0.43–0.84]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b18a","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Cerebrovascular diseases and hemiplegia (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.17","confidenceInterval":"CI95 [1.01–1.36]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b18b","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Chronic Obstructive Pulmonary Disease (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.76","confidenceInterval":"CI95 [1.49–2.08]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b18c","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Gastrointestinal disorders (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.18","confidenceInterval":"CI95 [1.02–1.37]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b18d","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Liver diseases (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.5","confidenceInterval":"CI95 [1.01–2.21]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b18e","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Arthritis (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.32","confidenceInterval":"CI95 [1.11–1.57]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b18f","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Osteoporosis (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.53","confidenceInterval":"CI95 [1.22–1.92]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01bb50f1f4482a19b190","firstAuthor":"Erlangsen","year":"2015","country":"Denmark","outcome":"SC","population":"Elderly women","riskFactor":"Spinal fracture (diagnosed ever)","comparator":"Not diagnosed","estimator":"RR","sizeEffect":"1.58","confidenceInterval":"CI95 [1.29–1.95]","pValue":"","design":"Cohort","__typename":"Result"}]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]}]},"Female youths and young adults":{"label":"Female youths and young adults","data":[{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":9,"results":[{"_id":"5ecd01ba50f1f4482a19ae90","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Female youths and young adults","riskFactor":"Any trauma-related hospital admission before age 16","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"1.85","confidenceInterval":"CI95 [1.77–1.94]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae91","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Female youths and young adults","riskFactor":"Reason for hospital admission: Self-harm","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"6.6","confidenceInterval":"CI95 [6.10–7.14]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae92","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Female youths and young adults","riskFactor":"Reason for hospital admission: Interpersonal violence","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"4.16","confidenceInterval":"CI95 [3.14–5.37]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae93","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Female youths and young adults","riskFactor":"Reason for hospital admission: Accident","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"1.47","confidenceInterval":"CI95 [1.40–1.55]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae94","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Female youths and young adults","riskFactor":"Frequency of trauma-related hospital admissions: Three or more items","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"7.4","confidenceInterval":"CI95 [5.87–9.17]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae95","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Female youths and young adults","riskFactor":"Frequency of trauma-related hospital admissions: Twice","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"3.12","confidenceInterval":"CI95 [2.77–3.50]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae96","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Female youths and young adults","riskFactor":"Frequency of trauma-related hospital admissions: Once","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"1.79","confidenceInterval":"CI95 [1.70–1.87]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae97","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Female youths and young adults","riskFactor":"Number of trauma-related hospitalization types: Two or three types","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"9.18","confidenceInterval":"CI95 [7.81–10.71]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae98","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Female youths and young adults","riskFactor":"Number of trauma-related hospitalization types: One type only","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"1.83","confidenceInterval":"CI95 [1.75–1.92]","pValue":"","design":"Cohort","__typename":"Result"}]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]}]},"Individuals first presenting to an emergency department after SA":{"label":"Individuals first presenting to an emergency department after SA","data":[{"count":8,"results":[{"_id":"5ecd01ba50f1f4482a19b02c","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SC","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Age group at index SA: 25-34 years","comparator":"10-24 years","estimator":"HR","sizeEffect":"2.68","confidenceInterval":"CI95 [1.29-5.58]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b02d","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SC","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Age group at index SA: 35-44 years","comparator":"10-24 years","estimator":"HR","sizeEffect":"5.56","confidenceInterval":"CI95 [2.89-10.69]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b02e","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SC","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Age group at index SA: 45-54 years","comparator":"10-24 years","estimator":"HR","sizeEffect":"5.87","confidenceInterval":"CI95 [3.00-11.46]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b02f","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SC","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Age group at index SA: ³ 55 years","comparator":"10-24 years","estimator":"HR","sizeEffect":"7.85","confidenceInterval":"CI95 [4.04-15.27]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b030","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SC","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Method of index SA: Hanging, strangling, suffocation","comparator":"Self-poisoning","estimator":"HR","sizeEffect":"2.55","confidenceInterval":"CI95 [1.29-5.01]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b031","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SC","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Method of index SA: Cutting or piercing","comparator":"Self-poisoning","estimator":"HR","sizeEffect":"1.81","confidenceInterval":"CI95 [1.22-2.67]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b032","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SC","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Method of index SA: Other","comparator":"Self-poisoning","estimator":"HR","sizeEffect":"2.61","confidenceInterval":"CI95 [1.52-4.48]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b033","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SC","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Psychiatric hospitalization after index SA","comparator":"No psychiatric hospitalization after index SA","estimator":"HR","sizeEffect":"1.74","confidenceInterval":"CI95 [1.22-2.49]","pValue":"","design":"Cohort","__typename":"Result"}]},{"count":7,"results":[{"_id":"5ecd01ba50f1f4482a19b025","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SA","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Male","comparator":"Female","estimator":"HR","sizeEffect":"0.7","confidenceInterval":"CI95 [0.63-0.79]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b026","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SA","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Method of index SA: Cutting or piercing","comparator":"Self-poisoning","estimator":"HR","sizeEffect":"1.22","confidenceInterval":"CI95 [1.08-1.36]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b027","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SA","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Method of index SA: Other","comparator":"Self-poisoning","estimator":"HR","sizeEffect":"0.7","confidenceInterval":"CI95 [0.53-0.92]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b028","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SA","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Recent psychiatric treatment","comparator":"No recent psychiatric treatment","estimator":"HR","sizeEffect":"2.19","confidenceInterval":"CI95 [1.97-2.43]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b029","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SA","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Type of emergency department attended for index SA: Somatic","comparator":"Psychiatric","estimator":"HR","sizeEffect":"1.31","confidenceInterval":"CI95 [1.14-1.51]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b02a","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SA","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Type of emergency department attended for index SA: Somatic and psychiatric","comparator":"Psychiatric","estimator":"HR","sizeEffect":"1.45","confidenceInterval":"CI95 [1.17-1.79]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19b02b","firstAuthor":"Fedyszyn","year":"2016","country":"Denmark","outcome":"SA","population":"Individuals first presenting to an emergency department after SA","riskFactor":"Psychiatric hospitalization after index SA","comparator":"No psychiatric hospitalization after index SA","estimator":"HR","sizeEffect":"0.81","confidenceInterval":"CI95 [0.7-0.94]","pValue":"","design":"Cohort","__typename":"Result"}]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]}]},"Male youths and young adults":{"label":"Male youths and young adults","data":[{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":9,"results":[{"_id":"5ecd01ba50f1f4482a19ae87","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Male youths and young adults","riskFactor":"Any trauma-related hospital admission before age 15","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"1.5","confidenceInterval":"CI95 [1.42–1.58]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae88","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Male youths and young adults","riskFactor":"Reason for hospital admission: Self-harm","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"2.24","confidenceInterval":"CI95 [1.84–2.69]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae89","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Male youths and young adults","riskFactor":"Reason for hospital admission: Interpersonal violence","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"3.14","confidenceInterval":"CI95 [2.37–4.05]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae8a","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Male youths and young adults","riskFactor":"Reason for hospital admission: Accident","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"1.54","confidenceInterval":"CI95 [1.46–1.62]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae8b","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Male youths and young adults","riskFactor":"Frequency of trauma-related hospital admissions: Three or more items","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"2.54","confidenceInterval":"CI95 [1.78–3.50]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae8c","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Male youths and young adults","riskFactor":"Frequency of trauma-related hospital admissions: Twice","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"1.97","confidenceInterval":"CI95 [1.71–2.26]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae8d","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Male youths and young adults","riskFactor":"Frequency of trauma-related hospital admissions: Once","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"1.56","confidenceInterval":"CI95 [1.48–1.65]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae8e","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Male youths and young adults","riskFactor":"Number of trauma-related hospitalization types: Two or three types","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"3.73","confidenceInterval":"CI95 [2.75–4.92]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19ae8f","firstAuthor":"Webb","year":"2017","country":"Denmark","outcome":"DSH","population":"Male youths and young adults","riskFactor":"Number of trauma-related hospitalization types: One type only","comparator":"No trauma-related hospital admission","estimator":"IRR","sizeEffect":"1.59","confidenceInterval":"CI95 [1.51–1.67]","pValue":"","design":"Cohort","__typename":"Result"}]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]}]},"Non-psychotic patients with severe depression":{"label":"Non-psychotic patients with severe depression","data":[{"count":9,"results":[{"_id":"5ecd01ba50f1f4482a19af9c","firstAuthor":"Leadholm","year":"2014","country":"Denmark","outcome":"SC","population":"Non-psychotic patients with severe depression","riskFactor":"Non-fatal intentional self-harm","comparator":"","estimator":"OR","sizeEffect":"4.8","confidenceInterval":"CI95 [3.9–5.9]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19af9d","firstAuthor":"Leadholm","year":"2014","country":"Denmark","outcome":"SC","population":"Non-psychotic patients with severe depression","riskFactor":"Male gender","comparator":"","estimator":"OR","sizeEffect":"1.9","confidenceInterval":"CI95 [1.6–2.3]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19af9e","firstAuthor":"Leadholm","year":"2014","country":"Denmark","outcome":"SC","population":"Non-psychotic patients with severe depression","riskFactor":"Hospital contact due to poisoning with analgesics","comparator":"","estimator":"OR","sizeEffect":"1.4","confidenceInterval":"CI95 [1.1–1.9]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19af9f","firstAuthor":"Leadholm","year":"2014","country":"Denmark","outcome":"SC","population":"Non-psychotic patients with severe depression","riskFactor":"Psychiatric bed-days above median","comparator":"","estimator":"OR","sizeEffect":"1.3","confidenceInterval":"CI95 [1.1–1.6]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19afa0","firstAuthor":"Leadholm","year":"2014","country":"Denmark","outcome":"SC","population":"Non-psychotic patients with severe depression","riskFactor":"Age at diagnosis of severe depression (years)","comparator":"","estimator":"OR","sizeEffect":"1.1","confidenceInterval":"CI95 [1.0–1.1]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19afa1","firstAuthor":"Leadholm","year":"2014","country":"Denmark","outcome":"SC","population":"Non-psychotic patients with severe depression","riskFactor":"Living alone","comparator":"","estimator":"OR","sizeEffect":"0.8","confidenceInterval":"CI95 [0.7–1.0]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19afa2","firstAuthor":"Leadholm","year":"2014","country":"Denmark","outcome":"SC","population":"Non-psychotic patients with severe depression","riskFactor":"Living in an institution","comparator":"","estimator":"OR","sizeEffect":"0.7","confidenceInterval":"CI95 [0.4–1.0]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19afa3","firstAuthor":"Leadholm","year":"2014","country":"Denmark","outcome":"SC","population":"Non-psychotic patients with severe depression","riskFactor":"Suffering from physical illness","comparator":"","estimator":"OR","sizeEffect":"0.5","confidenceInterval":"CI95 [0.4–0.6]","pValue":"","design":"Cohort","__typename":"Result"},{"_id":"5ecd01ba50f1f4482a19afa4","firstAuthor":"Leadholm","year":"2014","country":"Denmark","outcome":"SC","population":"Non-psychotic patients with severe depression","riskFactor":"Receiving disability pension","comparator":"","estimator":"OR","sizeEffect":"0.3","confidenceInterval":"CI95 [0.2–0.4]","pValue":"","design":"Cohort","__typename":"Result"}]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]},{"count":0,"results":[]}]}}

// =================================================================== Functions
const processResults = (instance) => {
  const list = instance.resultList
  if (list.length > 0) {
    const sorted = {}
    const outcomes = instance.outcomes
    const filter = instance.selectedFilter
    const filterByDatabaseKey = filter.filterByDatabaseKey
    const options = filter.options
    const matches = filter.matches
    const len = options.length
    let label = ''
    let min = 0
    let max = 0
    for (let i = 0; i < len; i++) {
      const option = options[i]
      label = option.name || option.category
      if (matches) {
        const matched = matches.find((obj) => {
          return label.toLowerCase().match(obj.regex)
        })
        if (matched) {
          label = matched.label
        }
      }
      if (!sorted.hasOwnProperty(label)) {
        sorted[label] = { label, data: [] }
      }
      Object.keys(outcomes).map((outcomeKey) => {
        const outcome = outcomes[outcomeKey]
        const results = list.filter((obj) => {
          return obj[filterByDatabaseKey] === label && outcome.matches.find((subObj) => {
            return subObj.toLowerCase() === obj.outcome.toLowerCase()
          })
        })
        const count = results.length
        if (min === 0 && max === 0) {
          min = count
          max = count
        } else if (count !== 0 && min > count) {
          min = count
        } else if (max < count) {
          max = count
        }
        const data = sorted[label].data
        if (data.length < 8) {
          sorted[label].data.push({
            count,
            results
          })
        }
        return false
      })
      const notEmpty = sorted[label].data.find(obj => obj.count !== 0)
      if (!notEmpty) {
        delete sorted[label]
      }
    }
    instance.scale = { min, max }
    instance.results = sorted
  } else {
    instance.results = PLACEHOLDER
  }
}

// ====================================================================== Export
export default {
  name: 'Chart',

  components: {
    FilterByDropdown
  },

  data () {
    return {
      count: 100,
      results: PLACEHOLDER,
      scale: {},
      filterByKey: 'risk-factor',
      filterByDatabaseKey: 'riskFactorCategory',
      filterByName: 'Risk Factor',
      current: false
    }
  },

  computed: {
    ...mapGetters({
      filters: 'query/filters',
      resultList: 'result/resultList',
      displayChart: 'result/displayChart',
      selectedResults: 'result/selectedResults',
      firstSearchPerformed: 'result/firstSearchPerformed'
    }),
    selectedFilter () {
      const filterByKey = this.filterByKey
      const filter = this.filters[filterByKey]
      return {
        filterByKey,
        filterByDatabaseKey: this.filterByDatabaseKey,
        filterByName: this.filterByName,
        options: filter.options,
        matches: filter.matches
      }
    },
    outcomes () {
      return this.filters.outcome.definitions
    }
  },

  watch: {
    resultList () {
      processResults(this)
    },
    filterByKey () {
      if (this.results) {
        processResults(this)
      }
    },
    selectedResults (val) {
      if (val.length === 0) {
        this.current = false
      }
    }
  },

  methods: {
    ...mapActions({
      setSelectedResults: 'result/setSelectedResults',
      setDisplayTables: 'result/setDisplayTables'
    }),
    getScale (count) {
      const scale = this.scale
      const num = (count / scale.max) * 100
      if (num <= 20) {
        return 1
      } else if (num <= 40) {
        return 2
      } else if (num <= 60) {
        return 3
      } else if (num <= 80) {
        return 4
      } else if (num <= 100) {
        return 5
      } else {
        return 1
      }
    },
    selectResults (results, key, index) {
      this.setSelectedResults(results)
      this.setDisplayTables(true)
      this.$emit('refreshSlider')
      this.current = { key, index }
      const resultTable = document.querySelector('.scroll-to-here-when-clicking-on-chart')
      this.$scrollToElement(resultTable, 200, -148)
    },
    selectFilterBy (payload) {
      this.filterByKey = payload.key
      this.filterByDatabaseKey = payload.databaseKey
      this.filterByName = payload.name
    },
    selected (key, index) {
      const current = this.current
      if (current.key === key && current.index === index) { return true }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
$countDimension: 2rem;

// ///////////////////////////////////////////////////////////////////// General
.chart {
  position: relative;
  &:before,
  &:after {
    content: '';
    position: absolute;
    left: 0;
    width: 100%;
    height: 2rem;
    z-index: 100;
  }
  &:before {
    top: 0;
    background: linear-gradient(to bottom, $athensGray, rgba(241, 241, 240, 0));
  }
  &:after {
    bottom: 0;
    background: linear-gradient(to top, $athensGray, rgba(241, 241, 240, 0));
  }
  &:not(.display-chart) {
    border-top: 1px solid transparent;
    .placeholder {
      display: flex;
    }
    .filter-by-dropdown,
    .container {
      filter: blur(2px);
      opacity: 0.5;
      pointer-events: none;
    }
  }
  .filter-by-dropdown,
  .container {
    @include small {
      filter: blur(2px);
      opacity: 0.5;
      pointer-events: none;
    }
  }
}

.container {
  max-height: 40rem;
  border-right: 1px solid $borderColor;
  overflow-y: scroll;
}

.placeholder {
  display: none;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  padding: 5rem;
  padding-right: calc((100vw - #{$containerWidth}) / 2 + 5rem);
  font-size: 1rem;
  font-weight: 700;
  z-index: 10;
  @include small {
    display: flex;
    padding: 5rem;
    &:after {
      content: 'This application is best viewed on larger screen sizes. Switch to a laptop or desktop for the best experience.'
    }
    span {
      display: none;
    }
  }
  @include tiny {
    padding: 3rem;
  }
}

// /////////////////////////////////////////////////////////////////////// Table
.table {
  display: flex;
  flex-direction: column;
  padding-right: 1rem;
  padding-bottom: 1rem;
}

.row {
  display: flex;
  flex-direction: row;
}

.cell {
  position: relative;
  width: calc(75% / 8);
  padding-top: calc(75% / 8);
  &:first-child {
    width: 25%;
  }
}

.cell-header,
.cell-label {
  .cell-content {
    font-size: 0.65rem;
  }
}

.cell-header {
  text-align: center;
}

.cell-label {
  .cell-content {
    justify-content: flex-end;
    text-align: right;
    padding-right: 1rem;
    padding-left: 1rem;
  }
}

.cell-number {
  position: relative;
  &:before,
  &:after {
    content: '';
    position: absolute;
    background-color: white;
    z-index: 5;
  }
  &:before {
    width: 2px;
    height: 100%;
    top: 0;
    left: calc(50% - 1px);
  }
  &:after {
    height: 2px;
    width: 100%;
    top: calc(50% - 1px);
    left: 0;
  }
}

.cell-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0.25rem;
  z-index: 10;
}

.cell-placeholder {
  padding: 2rem;
  padding-left: 2.375rem;
  font-weight: 700;
  span {
    color: $electricViolet;
  }
}

// /////////////////////////////////////////////////////////////////////// Count
.count {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  width: $countDimension;
  height: $countDimension;
  background-color: $hawkesBlue;
  transition: 250ms ease-out;
  &:hover {
    transition: 250ms ease-in;
    background-color: $electricViolet;
    color: white;
    .ring {
      transition: 150ms ease-in;
      border-color: $electricViolet;
      @for $i from 2 through 6 {
        &:nth-child(#{$i}) {
          transition-delay: ($i - 1) * 50ms;
        }
      }
    }
  }
  &.scale-1 {
    .ring:nth-child(2) {
      display: block
    }
  }
  &.scale-2 {
    .ring {
      &:nth-child(2),
      &:nth-child(3) {
        display: block;
      }
    }
  }
  &.scale-3 {
    .ring {
      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(4) {
        display: block;
      }
    }
  }
  &.scale-4 {
    .ring {
      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(4),
      &:nth-child(5) {
        display: block;
      }
    }
  }
  &.scale-5 {
    .ring {
      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(4),
      &:nth-child(5),
      &:nth-child(6) {
        display: block;
      }
    }
  }
  &.selected {
    background-color: $internationalKleinBlue;
    color: white;
    .ring {
      transition: 500ms 0ms ease-out !important;
      transform: scale(0);
    }
  }
}

.ring {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid $hawkesBlue;
  border-radius: 50%;
  z-index: -1;
  transition: 250ms ease-out;
  @for $i from 2 through 6 {
    &:nth-child(#{$i}) {
      top: calc((#{$countDimension} - (#{$countDimension} + #{$countDimension * (($i - 1) * 0.25)})) / 2);
      left: calc((#{$countDimension} - (#{$countDimension} + #{$countDimension * (($i - 1) * 0.25)})) / 2);
      width: calc(#{$countDimension} + #{$countDimension * (($i - 1) * 0.25)});
      height: calc(#{$countDimension} + #{$countDimension * (($i - 1) * 0.25)});
    }
  }
}
</style>
