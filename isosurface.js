async function isosurface(){
    ////// HTML
    container = document.createElement('div');
    container.setAttribute("style","width:800px");
    document.querySelector('body').appendChild(container);

    //// source
    const response = await fetch('../pf20.bin')
    let buffer = await response.arrayBuffer() // 取得 ArrayBuffer 實例
    // console.log(buffer.byteLength)
    // console.log(buffer)
    const f32 = new Float32Array(buffer);
    console.log(f32[10000000]);
  
      let minMax = f32.reduce(  (acc, val) =>{
      acc[0] = ( acc[0] === undefined || val < acc[0] ) ? val : acc[0]
            acc[1] = ( acc[1] === undefined || val > acc[1] ) ? val : acc[1]
            return acc;
    }, []);
    console.log(minMax);
  
    let width = 500, height = 500, depth = 100;
    let scalars = vtk.Common.Core.vtkDataArray.newInstance({
        values: f32,
        numberOfComponents: 1, // number of channels 
        dataType: vtk.Common.Core.vtkDataArray.VtkDataTypes.FLOAT, // values encoding
        name: 'scalars'
        
    });

    let imageData = vtk.Common.DataModel.vtkImageData.newInstance();
    imageData.setOrigin(0, 0, 0);
    imageData.setSpacing(1, 1, 1);
    imageData.setExtent(0, width - 1, 0, height - 1, 0, depth - 1);
    imageData.getPointData().setScalars(scalars);

    //// filter 
    const marchingCube = vtk.Filters.General.vtkImageMarchingCubes.newInstance({
        contourValue: 0.0,
        computeNormals: true,
        mergePoints: true,
    });
    marchingCube.setInputData(imageData); //source -> filter
    const firstIsoValue = 100;
    marchingCube.setContourValue(firstIsoValue);

    
    ///// mapper
    const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
    mapper.setInputConnection(marchingCube.getOutputPort());    // filter -> mapper

    ///// actor
    const actor = vtk.Rendering.Core.vtkActor.newInstance();    
    actor.setMapper(mapper);   //mapper -> acter

    ///// renderer
    const renderer = vtk.Rendering.Core.vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
    renderer.addActor(actor);
    renderer.resetCamera();  //actor -> renderer

    ///// renderer window    
    const renderWindow = vtk.Rendering.Core.vtkRenderWindow.newInstance();
    renderWindow.addRenderer(renderer);  //renderer -> renderer window
    const openglRenderWindow = vtk.Rendering.OpenGL.vtkRenderWindow.newInstance();
    openglRenderWindow.setSize(1000, 1000);
    openglRenderWindow.setContainer(container);
    renderWindow.addView(openglRenderWindow);   //renderer window -> openGL renderwindow

    ///// interactor
    const interactor = vtk.Rendering.Core.vtkRenderWindowInteractor.newInstance();
    interactor.setView(openglRenderWindow);   ///render window -> interactor
    interactor.initialize();
    interactor.bindEvents(container);
    interactor.setInteractorStyle(vtk.Interaction.Style.vtkInteractorStyleTrackballCamera.newInstance());
        
    
    //// html object interaction
    var rangeInput = document.getElementById("myRange");
    rangeInput.addEventListener('change', function() {
        console.log(rangeInput.value);
        const isoValue = rangeInput.value/100.0 * (minMax[1] - minMax[0]) + minMax[0];
        marchingCube.setContourValue(isoValue);
        renderWindow.render();
    });
    
    // ask vtk to do the first render
    renderWindow.render();

  }
  
  isosurface();
  
  
  
  
