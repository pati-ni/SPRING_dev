import * as d3 from 'd3';

import ColorBar from './colorBar';
import ForceLayout from './forceLayout_script.js';
import { doublet_setup } from './doublet_detector.js';
import SelectionScript from './selection_script.js';
import CloneViewer from './clone_viewer.js';
import { cluster_setup } from './cluster_script.js';
import { settings_setup, collapse_settings } from './settings_script.js';
import { make_new_SPRINGplot_setup } from './make_new_SPRINGplot_script.js';
import { downloadSelectedExpr_setup } from './downloadSelectedExpr_script.js';
import StickyNote from './stickyNote.js';
import { imputation_setup } from './smoothing_imputation.js';
import { selection_logic_setup } from './selection_logic.js';
import { PAGA_setup } from './PAGA_viewer.js';
import { colorpicker_setup } from './colorpicker_layout.js';

d3.select('#sound_toggle')
  .append('img')
  .attr('src', 'scripts_1_6_dev/sound_effects/icon_mute.svg')
  .on('click', function() {
    if (
      d3
        .select('#sound_toggle')
        .select('img')
        .attr('src') === 'scripts_1_6_dev/sound_effects/icon_speaker.svg'
    ) {
      d3.select('#sound_toggle')
        .select('img')
        .attr('src', 'scripts_1_6_dev/sound_effects/icon_mute.svg');
    } else {
      d3.select('#sound_toggle')
        .select('img')
        .attr('src', 'scripts_1_6_dev/sound_effects/icon_speaker.svg');
    }
  });

const callback = async () => {
  console.log('callback')
  d3.select('#load_colors').remove();
  let base_dir = graph_directory;
  let sub_dir = graph_directory + '/' + sub_directory;

  await $.ajax({
    data: { base_dir: base_dir },
    success: python_data => {
      ColorBar.create(sub_dir, python_data);
    },
    type: 'POST',
    url: 'cgi-bin/load_counts.py',
  });

  ForceLayout.instance.setup_download_dropdown();
  ForceLayout.instance.setup_tools_dropdown();
  ForceLayout.instance.center_view(false);

  CloneViewer.create(ForceLayout.instance);
  CloneViewer.instance.clone_sprites.visible = false;
  CloneViewer.instance.edge_container.visible = false;

  ForceLayout.instance.animation();

  settings_setup();
  SelectionScript.create();

  ForceLayout.instance.setup_layout_dropdown();

  make_new_SPRINGplot_setup();
  downloadSelectedExpr_setup();
  await StickyNote.create();

  imputation_setup();
  doublet_setup();
  cluster_setup();
  selection_logic_setup();
  colorpicker_setup();
  PAGA_setup();
  //load_text_annotation();
  //stratify_setup();
  //show_stratify_popup();
  //start_clone_viewer();
  //show_imputation_popup();
  //show_colorpicker_popup('HSC_HSC_fate1');

  window.onclick = function(event) {
    if (!event.target.matches('#settings_dropdown *')) {
      collapse_settings();
    }
    if (!event.target.matches('#download_dropdown_button')) {
      ForceLayout.instance.closeDropdown();
    }
    if (!event.target.matches('#layout_dropdown_button')) {
      ForceLayout.instance.closeDropdown();
    }
  };
};

let name = window.location.search;
let my_origin = window.location.origin;
let my_pathname = window.location.pathname;
let path_split = my_pathname.split('/');
let path_start = path_split.slice(0, path_split.length - 1).join('/');
path_split[path_split.length - 1] = 'springViewer_1_5_dev.html';

let dynamic_path = path_split.join('/');

d3.select('#changeViewer_link').attr('href', my_origin + dynamic_path + name);
let base_dirs = name.slice(1, name.length).split('/');
let base_dir_name = base_dirs.slice(0, base_dirs.length - 1).join('/');

d3.select('#all_SPRINGplots_menu').attr('href', my_origin + path_start + '/currentDatasetsList.html?' + base_dir_name);

var force_on = 1;
var n_nodes = 0;
var colors_loaded = 0;

export let graph_directory = name.slice(1, name.length);
let tmp = graph_directory.split('/');
graph_directory = tmp.slice(0, tmp.length - 1).join('/');

export let sub_directory = tmp[tmp.length - 1];

document.title = tmp[tmp.length - 1];

d3.select('#force_layout')
  .select('svg')
  .remove();
d3.select('#color_chooser')
  .selectAll('div')
  .remove();
d3.select('#color_chooser')
  .selectAll('input')
  .remove();
d3.select('#color_chooser')
  .selectAll('select')
  .remove();

ForceLayout.create(graph_directory, sub_directory, callback);
