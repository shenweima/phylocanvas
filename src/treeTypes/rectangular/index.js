import BranchRenderer from '../../BranchRenderer';
import Prerenderer from '../../Prerenderer';

import branchRendererOptions from './branchRenderer';
import prerendererOptions from './prerenderer';

import { Angles } from '../../utils/constants';

const labelAlign = {
  getX(node) {
    return node.tree.farthestNodeFromRootX * node.tree.currentBranchScale;
  },
  getY(node) {
    return node.centery;
  },
  getLabelOffset(node) {
    return (node.tree.farthestNodeFromRootX * node.tree.currentBranchScale - node.centerx);
  },
};

export default {
  branchRenderer: new BranchRenderer(branchRendererOptions),
  prerenderer: new Prerenderer(prerendererOptions),
  labelAlign,
  branchScalingAxis: 'x',
  getCollapsedMeasurements(branch) {
    return {
      angle: Angles.QUARTER,
      radius: branch.tree.step * branch.getNumberOfLeaves(),
    };
  },
};
