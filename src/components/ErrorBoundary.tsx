import React from 'react';
export class ErrorBoundary extends React.Component<{children:React.ReactNode;fallback?:React.ReactNode},{hasError:boolean}> {
  constructor(props:any){super(props);this.state={hasError:false};}
  static getDerivedStateFromError(){return{hasError:true};}
  render(){
    if(this.state.hasError){return this.props.fallback??(<div className="min-h-screen flex items-center justify-center bg-[#0a0908] text-[#d4a574]"><div className="text-center space-y-4"><p>Algo deu errado.</p><button onClick={()=>window.location.reload()} className="btn-primary">Recarregar</button></div></div>);}
    return this.props.children;
  }
}
