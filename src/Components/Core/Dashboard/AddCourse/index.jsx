import RenderSteps from "./RenderSteps"

export default function AddCourse(){
    return(
        <>
            <div className="text-white">
                <div>
                    <h1>Add Course</h1>
                    <div>
                        <RenderSteps/> 
                    </div>
                </div>
                <div>
                    <p>Code Upload Tips</p>
                    <ul>
                        <li>Set the course price option or make it free</li>
                        <li>Standard size for thr course thumbnail is 1072x960.</li>
                        <li>Video section control the course overview video.</li>
                        <li>Set the course price option or make it free</li>
                        <li>Standard size for thr course thumbnail is 1072x960.</li>
                        <li>Video section control the course overview video.</li>
                        <li>Standard size for thr course thumbnail is 1072x960.</li>
                        <li>Video section control the course overview video.</li>
                    </ul>
                </div>
            </div>
        </>
    )
}