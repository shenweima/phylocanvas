/** @jsx React.DOM */

var WorkflowQuestionAnswerButton = React.createClass({
    handleClick: function() {
        this.props.onToggle(false);
    },
    render: function() {
        var classes = React.addons.classSet({
            'wgst-workflow-question-answer-button': true
        });
        return (
            <button className={classes} data-answer-value={this.props.value} onClick={this.handleClick}>{this.props.label}</button>
        );
    }
});

var WorkflowQuestionTitle = React.createClass({
    render: function() {
        return (
            <header>
                <h3>{this.props.title}</h3>
            </header>
        );
    }
});

var WorkflowQuestion = React.createClass({
    getInitialState: function() {
        return { show: true };
    },
    handleToggle: function(show) {
        this.setState({
            show: show
        });
    },
    render: function() {
        var that = this;
        var buttons = this.props.buttons.map(function(button){
            return (<WorkflowQuestionAnswerButton
                        label={button.label} 
                        value={button.value} 
                        onToggle={that.handleToggle} />);
        });

        if (this.state.show) {
            return (
                <article className="wgst-workflow-question">
                    <section>
                        <WorkflowQuestionTitle title={this.props.title} />
                        <div>{buttons}</div>
                    </section>
                </article>
            );
        } else {
            return null;
        }
    }
});