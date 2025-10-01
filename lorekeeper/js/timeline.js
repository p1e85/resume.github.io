document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('timeline');
    const eventForm = document.getElementById('event-form');

    // Render timeline
    function renderTimeline() {
        const items = new vis.DataSet(lorekeeperData.timelineEvents);
        const options = {
            width: '100%',
            height: '400px',
            margin: { item: 20 }
        };
        new vis.Timeline(container, items, options);
    }

    // Handle event form submission
    eventForm.addEventListener('submit', e => {
        e.preventDefault();
        const content = document.getElementById('event-content').value;
        const start = document.getElementById('event-start').value;
        addTimelineEvent(content, start);
        renderTimeline();
        eventForm.reset();
    });

    renderTimeline();
});
