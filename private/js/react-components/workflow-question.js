/** @jsx React.DOM */

var WorkflowQuestion = React.createClass({
    render: function() {
        return (
        	<article class="wgst-workflow-question">
        		<WorkflowQuestionTitle />
        		<WorkflowQuestionAnswerButton />
        		<WorkflowQuestionAnswerButton />
        	</article>
        );
    }
});

var WorkflowQuestionTitle = React.createClass({
    render: function() {
        return (
			<header>
				<h3>What is the question?</h3>
			</header>
        );
    }
});

var WorkflowQuestionAnswerButton = React.createClass({
    render: function() {
        return (
        	<button class="wgst-workflow-question-answer-button" data-answer-value="{this.prop.value}">{this.prop.label}</button>
        );
    }
});